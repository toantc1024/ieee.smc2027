// Preserve the spacing units used by the HCMUTE builder's saved pages.
export function spacingStyle(props: Record<string, unknown>) {
  const styles = (props?.styles || props || {}) as Record<string, unknown>;
  const unit = (value: unknown) => {
    if (value === undefined || value === null || value === "") return undefined;
    const stringValue = String(value).trim();
    if (!stringValue) return undefined;
    return /^-?\d*\.?\d+$/.test(stringValue) ? `${stringValue}px` : stringValue;
  };
  return {
    paddingTop: unit(styles.paddingTop),
    paddingBottom: unit(styles.paddingBottom),
    marginTop: unit(styles.marginTop),
    marginBottom: unit(styles.marginBottom),
    backgroundColor: typeof styles.backgroundColor === "string" ? styles.backgroundColor : undefined,
    background: typeof styles.backgroundGradient === "string" ? styles.backgroundGradient : undefined,
    color: typeof styles.textColor === "string" ? styles.textColor : undefined,
  };
}
