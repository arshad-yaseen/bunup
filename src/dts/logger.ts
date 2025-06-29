import type { OxcError, Severity } from 'oxc-transform'
import pc from 'picocolors'
import { UNDERSTANDING_ISOLATED_DECLARATIONS_URL } from '../constants'
import { logger } from '../logger'
import { getShortFilePath, isDev } from '../utils'

export type IsolatedDeclarationError = {
	error: OxcError
	file: string
	content: string
}

export function logIsolatedDeclarationErrors(
	errors: IsolatedDeclarationError[],
): void {
	let hasSeverityError = false
	for (const error of errors) {
		if (error.error.severity === 'Error') {
			hasSeverityError = true
		}

		logSingle(error)
	}

	if (hasSeverityError) {
		if (isDev()) {
			console.log(
				`\n${pc.yellow('Please address the suggestions above before publishing your package.')}\n`,
			)
		}

		console.log(
			`${pc.cyan('Why?')} ${pc.underline(
				UNDERSTANDING_ISOLATED_DECLARATIONS_URL,
			)}\n`,
		)

		if (!isDev()) {
			process.exit(1)
		}
	}
}

export function logSingle(error: IsolatedDeclarationError): void {
	const label = error.error.labels[0]
	const position = label
		? calculateDtsErrorLineAndColumn(error.content, label.start)
		: ''

	const shortPath = getShortFilePath(error.file)
	const errorMessage = `${shortPath}${position}: ${formatDtsErrorMessage(error.error.message)}`

	const { color, prefix } = getSeverityFormatting(error.error.severity)

	const formattedMessage = `${color(prefix)} ${errorMessage}`

	const codeFrame = label
		? getCodeFrame(error.content, label.start, label.end)
		: error.error.codeframe
			? error.error.codeframe
			: ''

	const helpMessage = error.error.helpMessage
		? `\n${pc.cyan('Help:')} ${error.error.helpMessage}`
		: ''

	console.log(`\n${formattedMessage}${helpMessage}\n\n${pc.gray(codeFrame)}`)
}

function getSeverityFormatting(severity: Severity): {
	color: (text: string) => string
	prefix: string
} {
	if (isDev()) {
		switch (severity) {
			case 'Error':
				return {
					color: pc.blue,
					prefix: 'Suggestion',
				}
			case 'Warning':
				return { color: pc.yellow, prefix: 'Suggestion' }
			case 'Advice':
				return { color: pc.blue, prefix: 'Advice' }
			default:
				return {
					color: pc.blue,
					prefix: 'Suggestion',
				}
		}
	}

	switch (severity) {
		case 'Error':
			return {
				color: pc.red,
				prefix: 'ERROR',
			}
		case 'Warning':
			return { color: pc.yellow, prefix: 'WARNING' }
		case 'Advice':
			return { color: pc.blue, prefix: 'ADVICE' }
		default:
			return {
				color: pc.red,
				prefix: 'ERROR',
			}
	}
}

function formatDtsErrorMessage(errorMessage: string): string {
	return errorMessage
		.replace(' with --isolatedDeclarations', '')
		.replace(' with --isolatedDeclaration', '')
}

function calculateDtsErrorLineAndColumn(
	sourceText: string,
	labelStart: number,
): string {
	if (labelStart === undefined) return ''

	const lines = sourceText.slice(0, labelStart).split('\n')
	const lineNumber = lines.length
	const columnStart = lines[lines.length - 1].length + 1

	return ` (${lineNumber}:${columnStart})`
}

function getCodeFrame(sourceText: string, start: number, end: number): string {
	const lines = sourceText.split('\n')
	const errorLine = sourceText.slice(0, start).split('\n').length
	const lineContent = lines[errorLine - 1]

	const startCol = start - sourceText.slice(0, start).lastIndexOf('\n') - 1
	const endCol = end
		? Math.min(
				end - sourceText.slice(0, start).lastIndexOf('\n') - 1,
				lineContent.length,
			)
		: startCol + 1

	const arrowLine =
		' '.repeat(startCol) +
		pc[isDev() ? 'blue' : 'red'](
			pc.dim('⎯'.repeat(Math.max(1, endCol - startCol))),
		)

	return `${lineContent}\n${arrowLine}`
}

export function handleBunBuildLogs(
	logs: Array<BuildMessage | ResolveMessage>,
): void {
	for (const log of logs) {
		if (log.level === 'error') {
			logger.error(`${log.message} in ${log.position?.file}`)
			throw new Error('Failed to generate declaration file')
		}

		if (log.level === 'warning') {
			logger.warn(log.message)
		}

		if (log.level === 'info') {
			logger.info(log.message)
		}
	}
}
