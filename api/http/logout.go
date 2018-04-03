package http

import (
	"net/http"

	"github.com/18F/e-QIP-prototype/api"
)

type LogoutHandler struct {
	Env      *api.Settings
	Log      *api.LogService
	Token    *api.TokenService
	Database *api.DatabaseService
}

// Logout will end the user session.
func (service LogoutHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	account := &api.Account{}

	// Valid token and audience while populating the audience ID
	_, err := service.Token.CheckToken(r, account.ValidJwtToken)
	if err != nil {
		service.Log.Warn(api.InvalidJWT, err, api.LogFields{})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the account information from the data store
	if err := account.Get(); err != nil {
		service.Log.Warn(api.NoAccount, err, api.LogFields{})
		EncodeErrJSON(w, err)
		return
	}

	// If the account is locked then we cannot proceed
	if account.Locked {
		service.Log.Warn(api.AccountLocked, api.LogFields{})
		EncodeErrJSON(w, err)
		return
	}

	service.Log.Info(api.LoggedOut, api.LogFields{})
}
