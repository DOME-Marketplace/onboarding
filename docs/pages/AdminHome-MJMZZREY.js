import {
  Client
} from "../chunks/chunk-QRP43PCI.js";

// front/src/pages/AdminHome.js
var MHR = window.MHR;
console.log("ENVIRONMENT", window.domeEnvironment);
console.log("BUYER ONBOARDING API", window.onboardServer);
var pb = new Client(window.onboardServer);
var gotoPage = MHR.gotoPage;
var html = MHR.html;
var serverAvailable = false;
MHR.register(
  "AdminHome",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter() {
      debugger;
      try {
        const result = await fetch(window.onboardServer + "/api/health");
        console.log("Server is available:", result);
        serverAvailable = true;
      } catch (error) {
        console.log("Server is not available:", error);
        serverAvailable = false;
      }
      if (!serverAvailable) {
        let theHtml = html` <h3>Server is not available</h3> `;
        return;
      }
      if (pb.authStore.record?.collectionName !== "admins") {
        let theHtml = html`
          <h2>Admin for DOME Marketplace Onboarding</h2>

          <h3>Login as administrator</h3>
          <form
            id="login-form"
            @submit=${(ev) => this.submitForm(ev)}
          >
            <fieldset>
              <legend>Login</legend>

              <label for="login_email">Email</label>
              <input id="login_email" type="email" placeholder="Email" />
              <label for="login_password">Password</label>
              <input
                id="login_password"
                type="password"
                placeholder="Type your Password"
              />

              <button type="submit">Login</button>
            </fieldset>
          </form>
        `;
        this.render(theHtml, false);
      } else {
        gotoPage("AdminTable", null);
      }
    }
    async submitForm(ev) {
      ev.preventDefault();
      debugger;
      const authData = await pb.collection("admins").authWithPassword(
        me("#login_email").value,
        me("#login_password").value
      );
      gotoPage("AdminTable", null);
    }
  }
);
MHR.register(
  "AdminTable",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter() {
      const records = await pb.collection("buyers").getFullList({
        sort: "-created"
      });
      debugger;
      let theHtml = html`
        <h2>Admin for DOME Marketplace Onboarding</h2>

        <table id="myTable" class="display">
          <thead>
            <tr>
              <th>Email</th>
              <th>Verified</th>
              <th>Organization</th>
            </tr>
          </thead>
          <tbody>
            ${records.map((record) => {
        return html`
                <tr>
                  <td>${record.email}</td>
                  <td>${record.verified ? "Yes" : "No"}</td>
                  <td>${record.organization}</td>
                </tr>
              `;
      })}
          </tbody>
        </table>
      `;
      this.render(theHtml, false);
      let table = new window.DataTable("#myTable", {
        buttons: ["copy", "csv", "excel", "pdf", "print"],
        layout: {
          topStart: "buttons"
        }
      });
    }
  }
);
