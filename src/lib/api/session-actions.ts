// API client for session quick actions

export async function autoAssignPlayers(sessionId: string, strategy: string) {
  const res = await fetch(`/api/sessions/${sessionId}/auto-assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ strategy }),
  });
  if (!res.ok) throw new Error("Auto-assign failed");
  return res.json();
}

export async function updateWaitTimes(sessionId: string, minutesToAdd: number) {
  const res = await fetch(`/api/sessions/${sessionId}/wait-times`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ minutesToAdd }),
  });
  if (!res.ok) throw new Error("Update wait times failed");
  return res.json();
}

export async function resetWaitTimes(sessionId: string) {
  const res = await fetch(`/api/sessions/${sessionId}/wait-times`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ minutesToAdd: 0, resetType: "current" }),
  });
  if (!res.ok) throw new Error("Reset wait times failed");
  return res.json();
}
