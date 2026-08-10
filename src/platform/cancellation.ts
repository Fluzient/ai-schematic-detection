export interface CancellationSignal {
	readonly aborted: boolean;
	readonly reason: unknown;
	addEventListener: (type: 'abort', listener: () => void, options?: { once?: boolean }) => void;
	removeEventListener: (type: 'abort', listener: () => void) => void;
}

export interface CancellationController {
	readonly signal: CancellationSignal;
	abort: (reason?: unknown) => void;
}

interface NativeAbortControllerConstructor {
	new (): CancellationController;
}

class CompatibleCancellationSignal implements CancellationSignal {
	private abortedState = false;
	private abortReason: unknown;
	private readonly listeners = new Set<() => void>();

	get aborted(): boolean {
		return this.abortedState;
	}

	get reason(): unknown {
		return this.abortReason;
	}

	addEventListener(type: 'abort', listener: () => void): void {
		if (type !== 'abort')
			return;

		if (this.abortedState) {
			listener();
			return;
		}

		this.listeners.add(listener);
	}

	removeEventListener(type: 'abort', listener: () => void): void {
		if (type === 'abort')
			this.listeners.delete(listener);
	}

	abort(reason?: unknown): void {
		if (this.abortedState)
			return;

		this.abortedState = true;
		this.abortReason = reason;
		const listeners = [...this.listeners];
		this.listeners.clear();

		for (const listener of listeners) {
			try {
				listener();
			}
			catch {
				// A faulty listener must not block cancellation of the remaining work.
			}
		}
	}
}

class CompatibleCancellationController implements CancellationController {
	private readonly compatibleSignal = new CompatibleCancellationSignal();
	readonly signal: CancellationSignal = this.compatibleSignal;

	abort(reason?: unknown): void {
		this.compatibleSignal.abort(reason);
	}
}

export function createCancellationController(): CancellationController {
	const NativeAbortController = (globalThis as { AbortController?: unknown }).AbortController;

	if (typeof NativeAbortController === 'function') {
		try {
			return new (NativeAbortController as NativeAbortControllerConstructor)();
		}
		catch {
			// Some EDA hosts expose AbortController as a non-constructable shim.
		}
	}

	return new CompatibleCancellationController();
}
