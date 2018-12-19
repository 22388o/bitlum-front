/**
 * App entrypoint
 *
 */

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import { Provider, observer, inject } from 'mobx-react';
import MobxDevTools from 'mobx-react-devtools';
import {
  HashRouter as Router,
  Route,
  NavLink,
  withRouter,
  Redirect,
  Switch,
} from 'react-router-dom';
import { I18nextProvider, withNamespaces } from 'react-i18next';

// import registerServiceWorker from 'registerServiceWorker';
import GA from 'utils/GA';
import LiveChat from 'utils/LiveChat';
import log from 'utils/logging';
import getNet from 'utils/cryptonetChecker';
import i18nConfig from 'locales';

import stores from 'stores';

import Login from 'scenes/Login';
import Signup from 'scenes/Signup';
import Landing from 'scenes/Landing';
import Payments from 'scenes/Payments';
import Payment from 'scenes/Payment';
import Check from 'scenes/Check';
import Confirm from 'scenes/Confirm';
import Receive from 'scenes/Receive';

import { Global as GlobalStyles, Root, Footer, Main } from './styles';

// -----------------------------------------------------------------------------
// Code
// -----------------------------------------------------------------------------

log.debug(`Running on React v${React.version}`);
log.debug('MobX is in strict mode');
configure({
  enforceActions: 'observed',
});

LiveChat.boot();

class App extends Component {
  componentWillMount() {
    // eslint-disable-next-line
    const { history } = this.props;
    GA({ type: 'pageview', page: window.location.pathname });
    window.localStorage.setItem(
      'referral',
      new URLSearchParams(window.location.search).get('referral'),
    );
    this.unlisten = history.listen(location => {
      GA({ type: 'pageview', page: location.pathname });
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    // eslint-disable-next-line
    const { accounts, ui, t } = this.props;

    return (
      <Root>
        <GlobalStyles />
        <Main>
          {!accounts.authenticate.isAuthenticated ? (
            <Switch>
              <Route exact path="/" component={Login} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Redirect to="/login" />
            </Switch>
          ) : (
            [
              <Switch key="Switch">
                <Route path="/payments/receive" component={Receive} />
                <Route path="/payments/check" component={Check} />
                <Route path="/payments/confirm" component={Confirm} />
                <Route path="/payments/:puid" component={Payment} />
                <Route path="/payments" component={Payments} />
                <Route
                  path="/signout"
                  render={() => {
                    accounts.authenticate.signout();
                    return null;
                  }}
                />
                <Redirect to="/payments" />
              </Switch>,
            ]
          )}
        </Main>
      </Root>
    );
  }
}

const AppWrap = withRouter(withNamespaces()(inject('accounts', 'ui')(observer(App))));

ReactDOM.render(
  <Provider {...stores}>
    <I18nextProvider i18n={i18nConfig}>
      <Router>
        <AppWrap />
      </Router>
    </I18nextProvider>
  </Provider>,
  document.getElementById('root'),
);

if (process.env.NODE_ENV === 'development') {
  window.stores = stores;
  ReactDOM.render(<MobxDevTools />, document.getElementById('dev'));
}

// registerServiceWorker();
