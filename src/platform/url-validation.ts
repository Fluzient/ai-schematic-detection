/**
 * EDA 扩展主上下文不保证提供浏览器 URL 构造器，因此只做绝对地址与协议校验。
 */
export function isAbsoluteUrlWithProtocols(value: unknown, protocols: readonly string[]): value is string {
	if (typeof value !== 'string') {
		return false;
	}

	const normalized = value.trim();
	if (!normalized || /\s/.test(normalized)) {
		return false;
	}

	const separatorIndex = normalized.indexOf('://');
	if (separatorIndex <= 0) {
		return false;
	}

	const protocol = normalized.slice(0, separatorIndex).toLowerCase();
	if (!/^[a-z][a-z\d+.-]*$/i.test(protocol) || !protocols.includes(protocol)) {
		return false;
	}

	const remainder = normalized.slice(separatorIndex + 3);
	const authorityEnd = remainder.search(/[/?#]/);
	const authority = authorityEnd >= 0 ? remainder.slice(0, authorityEnd) : remainder;
	return authority.length > 0;
}

export function isHttpUrl(value: unknown): value is string {
	return isAbsoluteUrlWithProtocols(value, ['http', 'https']);
}

export function isWebSocketUrl(value: unknown): value is string {
	return isAbsoluteUrlWithProtocols(value, ['ws', 'wss']);
}
