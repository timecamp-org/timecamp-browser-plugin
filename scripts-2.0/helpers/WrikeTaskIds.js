// These are candidate encodings, not a guaranteed Wrike API contract.
// Only use a candidate after matching it against a task returned by TimeCamp.
export const buildWrikeTaskIdCandidates = (taskId, accountId) => {
    const isPositiveInteger = value => typeof value === 'string' && /^[1-9]\d*$/.test(value);
    // 2^64 - 1 is the largest unsigned value accepted by the 8-byte legacy layout.
    if (!isPositiveInteger(taskId) || BigInt(taskId) > BigInt('18446744073709551615')) {
        return [];
    }

    const legacy = new Uint8Array(9);
    legacy[0] = 0x30;
    new DataView(legacy.buffer).setBigUint64(1, BigInt(taskId), false);
    const candidates = ['wrike_task_' + btoa(String.fromCharCode(...legacy))];

    // The observed account-scoped layout has two unsigned 32-bit fields.
    // Larger IDs must not be truncated into this format.
    if (!isPositiveInteger(accountId) || BigInt(accountId) > BigInt('4294967295')
        || BigInt(taskId) > BigInt('4294967295')) {
        return candidates;
    }

    const bytes = new Uint8Array(10);
    const view = new DataView(bytes.buffer);
    bytes[0] = 0x41; // A: account
    view.setUint32(1, Number(accountId), false);
    bytes[5] = 0x54; // T: task
    view.setUint32(6, Number(taskId), false);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let encoded = '', buffer = 0, bits = 0;
    for (const byte of bytes) {
        buffer = (buffer << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            bits -= 5;
            encoded += alphabet[(buffer >>> bits) & 31];
        }
        buffer &= (1 << bits) - 1;
    }
    return [...candidates, 'wrike_task_' + encoded];
};
