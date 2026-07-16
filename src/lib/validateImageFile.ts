// The `accept="image/*"` attribute on file inputs is only a hint to the
// OS file picker — it doesn't actually stop someone from selecting a
// non-image file (many pickers have an "All Files" option, and it does
// nothing at all for drag-and-drop). This is the actual validation.
const MAX_IMAGE_SIZE_MB = 15;

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return `"${file.name}" isn't an image file.`;
  }

  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" is too large (max ${MAX_IMAGE_SIZE_MB}MB).`;
  }

  return null;
}

/**
 * Validates a list of files, returning only the valid ones plus a list of
 * error messages for anything rejected — lets the caller keep whatever
 * was valid instead of discarding the whole selection over one bad file.
 */
export function validateImageFiles(files: File[]): {
  valid: File[];
  errors: string[];
} {
  const valid: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const error = validateImageFile(file);
    if (error) {
      errors.push(error);
    } else {
      valid.push(file);
    }
  }

  return { valid, errors };
}
