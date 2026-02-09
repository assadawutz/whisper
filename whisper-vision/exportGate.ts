export function canExport(params: {
  locked: boolean;
  driftDetected: boolean;
  verificationPass: boolean;
  boxesLen: number;
  nodesLen: number;
  missingHintsCount: number;
}) {
  const reasons: string[] = [];
  if (!params.locked) reasons.push("BLUEPRINT_NOT_LOCKED");
  if (params.driftDetected) reasons.push("DRIFT_DETECTED");
  if (!params.verificationPass) reasons.push("VERIFY_TRUTH_FAILED");
  if (params.boxesLen <= 0) reasons.push("NO_BOXES");
  if (params.nodesLen <= 0) reasons.push("NO_NODES");
  if (params.missingHintsCount > 0) reasons.push("MISSING_LAYOUT_HINTS");

  return { ok: reasons.length === 0, reasons };
}
