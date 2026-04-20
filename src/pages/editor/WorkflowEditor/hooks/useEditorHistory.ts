import { useRef, useState, useCallback } from 'react';
import { HistoryManager, IHistoryState } from '../_helper/serializer.helper';

export const useEditorHistory = () => {
	const historyRef = useRef(new HistoryManager());
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	const push = useCallback((state: IHistoryState) => {
		historyRef.current.push(state);
		setCanUndo(historyRef.current.canUndo());
		setCanRedo(historyRef.current.canRedo());
	}, []);

	const undo = useCallback(() => {
		const state = historyRef.current.undo();
		if (state) {
			setCanUndo(historyRef.current.canUndo());
			setCanRedo(historyRef.current.canRedo());
		}
		return state;
	}, []);

	const redo = useCallback(() => {
		const state = historyRef.current.redo();
		if (state) {
			setCanUndo(historyRef.current.canUndo());
			setCanRedo(historyRef.current.canRedo());
		}
		return state;
	}, []);

	const clear = useCallback(() => {
		historyRef.current.clear();
		setCanUndo(false);
		setCanRedo(false);
	}, []);

	return {
		push,
		undo,
		redo,
		clear,
		canUndo,
		canRedo,
	};
};
