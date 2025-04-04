import {Plugin} from 'rolldown';

import {allFilesUsedToBundleDts} from '../build';
import {DtsMap} from './generator';
import {
      addDtsVirtualPrefix,
      getDtsPath,
      isDtsVirtualFile,
      removeDtsVirtualPrefix,
      resolveImportedTsFilePath,
} from './utils';

export const DTS_VIRTUAL_FILE_PREFIX = '\0dts:';

export const gerVirtualFilesPlugin = (
      dtsMap: DtsMap,
      pathAliases: Map<string, string>,
      baseUrl: string,
): Plugin => {
      return {
            name: 'bunup:virtual-dts',
            async resolveId(source: string, importer?: string) {
                  if (isDtsVirtualFile(source)) return source;
                  if (!importer || !isDtsVirtualFile(importer)) return null;

                  const resolvedPath = await resolveImportedTsFilePath(
                        source,
                        pathAliases,
                        baseUrl,
                        removeDtsVirtualPrefix(importer),
                  );

                  if (!resolvedPath) return null;

                  const dtsPath = getDtsPath(resolvedPath);

                  if (dtsMap.has(dtsPath)) {
                        return addDtsVirtualPrefix(dtsPath);
                  }

                  return null;
            },
            load(id: string) {
                  if (id.startsWith(DTS_VIRTUAL_FILE_PREFIX)) {
                        const dtsPath = removeDtsVirtualPrefix(id);
                        const content = dtsMap.get(dtsPath);
                        if (content) {
                              allFilesUsedToBundleDts.add(dtsPath);
                              return content;
                        }
                  }
                  return null;
            },
      };
};
