import { makeAutoObservable } from 'mobx';

import type { Action } from '@mino/models';
import type { EditorEngine } from '../engine';

import {
    transformRedoAction,
    undoAction,
    updateTransactionActions,
} from './helpers';

enum TransactionType {
    IN_TRANSACTION = 'in-transaction',
    NOT_IN_TRANSACTION = 'not-in-transaction',
}

interface InTransaction {
    type: TransactionType.IN_TRANSACTION;
    actions: Action[];
}

interface NotInTransaction {
    type: TransactionType.NOT_IN_TRANSACTION;
}

type TransactionState = InTransaction | NotInTransaction;

/** Undo/redo stack for all editor actions. Supports transactions to group
 *  multiple rapid edits (like keystrokes) into a single undo step.
 *  Each push also writes the action to code via CodeManager. */
export class HistoryManager {
    constructor(
        private editorEngine: EditorEngine,
        private undoStack: Action[] = [],
        private redoStack: Action[] = [],
        private inTransaction: TransactionState = {
            type: TransactionType.NOT_IN_TRANSACTION,
        },
    ) {
        makeAutoObservable(this);
    }

    get canUndo() {
        return this.undoStack.length > 0;
    }

    get canRedo() {
        return this.redoStack.length > 0;
    }

    get isInTransaction() {
        return this.inTransaction.type === TransactionType.IN_TRANSACTION;
    }

    get length() {
        return this.undoStack.length;
    }

    startTransaction = () => {
        this.inTransaction = {
            type: TransactionType.IN_TRANSACTION,
            actions: [],
        };
    };

    commitTransaction = async () => {
        if (
            this.inTransaction.type === TransactionType.NOT_IN_TRANSACTION ||
            this.inTransaction.actions.length === 0
        ) {
            this.inTransaction = { type: TransactionType.NOT_IN_TRANSACTION };
            return;
        }

        const actionsToCommit = this.inTransaction.actions;
        this.inTransaction = { type: TransactionType.NOT_IN_TRANSACTION };
        for (const action of actionsToCommit) {
            await this.push(action);
        }
    };

    push = async (action: Action) => {
        if (this.inTransaction.type === TransactionType.IN_TRANSACTION) {
            this.inTransaction.actions = updateTransactionActions(
                this.inTransaction.actions,
                action,
            );
            return;
        }

        if (this.redoStack.length > 0) {
            this.redoStack = [];
        }

        this.undoStack.push(action);

        // TODO: Uncomment it out when CodeManager is done
        // await this.editorEngine.code.writre(action);
    };

    undo = (): Action | null => {
        if (this.inTransaction.type === TransactionType.IN_TRANSACTION) {
            void this.commitTransaction();
        }

        const top = this.undoStack.pop();
        if (top == null) return null;

        const action = undoAction(top);
        this.redoStack.push(top);

        return action;
    };

    redo = (): Action | null => {
        if (this.inTransaction.type === TransactionType.IN_TRANSACTION) {
            void this.commitTransaction();
        }

        const top = this.redoStack.pop();
        if (top == null) return null;

        const action = transformRedoAction(top);
        this.undoStack.push(action);
        return action;
    };

    clear = () => {
        this.undoStack = [];
        this.redoStack = [];
    };
}
