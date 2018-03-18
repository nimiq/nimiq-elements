import XElement from '/libraries/x-element/x-element.js';
import XAccount from './x-account.js';
import reduxify from '/libraries/redux/src/redux-x-element.js';
import store from '/apps/safe/store/store.js';

export default class XAccounts extends XElement {
    html() {
        return `
            <button create class="small">&plus; Create</button>
            <button import class="small">&#8615; Import</button>
            <x-accounts-list>
                <x-loading-animation></x-loading-animation>
                <h2>Loading accounts...</h2>
            </x-accounts-list>
        `
    }

    onCreate() {
        this._accounts = new Map();
        this.$accountsList = this.$('x-accounts-list');
    }

    listeners() {
        return {
            'click button[create]': this._onCreateAccount,
            'click button[import]': this._onImportAccount
        }
    }

    _onPropertiesChanged(changes) {
        if (this.$('x-loading-animation')) {
            this.$accountsList.textContent = '';
        }

        if (changes.accounts) {
            for (const [ address, account ] of changes.accounts) {
                if (account === undefined) {
                    // todo test!
                    const { element } = this._accounts.get(address);
                    element.destroy();
                    this._accounts.delete(address);
                } else {
                    this.addAccount(account);
                }
            }
        }
    }

    /**
     * @param {object} account
     */
    addAccount(account) {
        this._accounts.set(account.address, { account, element: this._createAccount(account)});
    }

    _createAccount(account) {
        const $account = reduxify(
            store,
            state => {
                const entry = state.accounts.entries.get(account.address);
                return {
                    balance: entry.balance,
                    label: entry.label
                };
            }
        )(XAccount).createElement();

        $account.setProperties({
            ...account
        });

        this.$accountsList.appendChild($account.$el);

        return $account;
    }

    _onCreateAccount() {
        this.fire('x-accounts-create');
    }

    _onImportAccount() {
        this.fire('x-accounts-import');
    }
}