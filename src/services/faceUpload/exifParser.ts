/**
 * EXIF 方向解析模块
 * 从 JPEG 文件中提取 EXIF 方向信息
 */

export async function readOrientationFromFile(file: File): Promise<number | undefined> {
  const mime = (file.type || '').toLowerCase();
  if (!mime.includes('jpeg') && !mime.includes('jpg')) {
    // 只有 JPEG 格式可靠地包含 EXIF 方向信息
    return undefined;
  }
  try {
    const buffer = await file.arrayBuffer();
    return extractOrientationFromArrayBuffer(buffer);
  } catch (err) {
    console.warn('[exifParser] Failed to read EXIF orientation', err);
    return undefined;
  }
}

export function extractOrientationFromArrayBuffer(buffer: ArrayBuffer): number | undefined {
  const view = new DataView(buffer);
  if (view.byteLength < 2 || view.getUint16(0, false) !== 0xffd8) {
    return undefined;
  }

  let offset = 2;
  while (offset + 1 < view.byteLength) {
    const marker = view.getUint16(offset, false);
    offset += 2;

    if (marker === 0xffe1 && offset + 1 < view.byteLength) {
      const length = view.getUint16(offset, false);
      offset += 2;
      if (length < 8 || offset + length - 2 > view.byteLength) {
        return undefined;
      }

      const exifHeader = getAscii(view, offset, 4);
      if (exifHeader !== 'Exif') {
        offset += length - 2;
        continue;
      }

      const tiffOffset = offset + 6; // skip "Exif\0\0"
      if (tiffOffset + 8 > view.byteLength) {
        return undefined;
      }

      const byteOrder = view.getUint16(tiffOffset, false);
      const littleEndian = byteOrder === 0x4949;
      if (!littleEndian && byteOrder !== 0x4d4d) {
        return undefined;
      }

      const firstIFDOffset = view.getUint32(tiffOffset + 4, littleEndian);
      const ifdPointer = tiffOffset + firstIFDOffset;
      if (ifdPointer + 2 > view.byteLength) {
        return undefined;
      }

      const entryCount = view.getUint16(ifdPointer, littleEndian);
      for (let i = 0; i < entryCount; i++) {
        const entryOffset = ifdPointer + 2 + i * 12;
        if (entryOffset + 10 > view.byteLength) {
          break;
        }
        const tag = view.getUint16(entryOffset, littleEndian);
        if (tag === 0x0112) {
          const value = view.getUint16(entryOffset + 8, littleEndian);
          return value;
        }
      }
      return undefined;
    }

    if (marker < 0xff00) {
      break;
    }
    if (offset + 1 >= view.byteLength) {
      break;
    }
    const size = view.getUint16(offset, false);
    offset += size;
  }
  return undefined;
}

function getAscii(view: DataView, offset: number, length: number): string {
  const chars: string[] = [];
  for (let i = 0; i < length && offset + i < view.byteLength; i++) {
    const code = view.getUint8(offset + i);
    if (!code) break;
    chars.push(String.fromCharCode(code));
  }
  return chars.join('');
}
