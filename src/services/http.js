import { authHeader, formatHeader, activeAPI } from "../helpers";
import { ipGeoAPIKey } from "../constants/config";

export const httpService = {
  get(url, header) {
    const requestOptions = {
      method: "GET",
      headers: formatHeader(authHeader(header)),
    };
    return fetch(`${activeAPI()}/${url}`, requestOptions).then(handleResponse);
  },
  put(url, data, header) {
    const requestOptions = {
      method: "PUT",
      headers: formatHeader(authHeader(header)),
      body: JSON.stringify(data),
    };

    return fetch(`${activeAPI()}/${url}`, requestOptions).then(handleResponse);
  },
  post(url, data, header) {
    const requestOptions = {
      method: "POST",
      headers: formatHeader(authHeader(header)),
      body: JSON.stringify(data),
    };

    return fetch(`${activeAPI()}/${url}`, requestOptions).then(handleResponse);
  },
  delete(url, header) {
    const requestOptions = {
      method: "DELETE",
      headers: formatHeader(authHeader(header)),
    };

    return fetch(`${activeAPI()}/${url}`, requestOptions).then(handleResponse);
  },
  ipgeo() {
    return fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${ipGeoAPIKey}`, {
      method: "GET",
    }).then(handleResponse);
  },
  download(url) {
    const requestOptions = {
      method: "GET",
      headers: formatHeader(authHeader()),
    };

    return fetch(`${activeAPI()}/${url}`, requestOptions).then((response) =>
      response.blob()
    );
  },
  postFile(url, formData) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `${activeAPI()}/${url}`);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText,
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      };
      let user = JSON.parse(localStorage.getItem("user"));
      if (user && user.token) {
        xhr.setRequestHeader("Authorization", "Bearer " + user.token);
      }
      xhr.send(formData);
    });
  },
};

export const userService = {
  login(username, password) {
    const requestOptions = {
      method: "POST",
      headers: formatHeader(),
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    };

    return fetch(`${activeAPI()}/users/authenticate`, requestOptions)
      .then(handleResponse)
      .then((user) => {
        // login successful if there's a jwt token in the response
        if (user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem("user", JSON.stringify(user));
        }

        return user;
      });
  },
  logout() {
    const requestOptions = {
      method: "POST",
      headers: formatHeader(authHeader()),
      body: "",
    };

    return fetch(`${activeAPI()}/users/logout`, requestOptions).then(
      handleResponse
    );
  },
  forgotPassword(username, email) {
    const requestOptions = {
      method: "POST",
      headers: formatHeader(),
      body: JSON.stringify({
        username: username,
        email: email,
      }),
    };

    return fetch(`${activeAPI()}/users/forgot`, requestOptions).then(
      handleResponse
    );
  },
  resetPassword(username, code, password) {
    const requestOptions = {
      method: "POST",
      headers: formatHeader(),
      body: JSON.stringify({
        username: username,
        code: code,
        password: password,
      }),
    };

    return fetch(`${activeAPI()}/users/reset`, requestOptions).then(
      handleResponse
    );
  },
  register(user) {
    const requestOptions = {
      method: "POST",
      headers: formatHeader(),
      body: JSON.stringify(user),
    };

    return fetch(`${activeAPI()}/users/register`, requestOptions).then(
      handleResponse
    );
  },
  checkUsername(username) {
    const requestOptions = {
      method: "POST",
      headers: formatHeader(),
      body: JSON.stringify({
        username: username,
      }),
    };

    return fetch(`${activeAPI()}/users/available`, requestOptions).then(
      handleResponse
    );
  },
};

function handleResponse(response) {
  return response.text().then((text) => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        // auto logout if 401 response returned from api
        httpService.logout();
        location.reload(true);
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}
