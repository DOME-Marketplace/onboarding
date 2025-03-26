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
          <div class="ui wide container">
            <div class="ui centered grid">
              <div class="eight wide column">
                <div class="ui large top hidden menu">
                  <div class="ui container">
                    <div class="item">
                      <h2>Admin for DOME Marketplace Onboarding</h2>
                    </div>
                  </div>
                </div>

                <h3>Login as administrator</h3>

                <form
                  class="ui large form"
                  id="login-form"
                  @submit=${(ev) => this.submitForm(ev)}
                >
                  <div class="field">
                    <label>Email</label>
                    <input
                      id="login_email"
                      type="email"
                      name="login_email"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div class="field">
                    <label>Password</label>
                    <input
                      id="login_password"
                      type="password"
                      name="login_password"
                      placeholder="Type your password"
                    />
                  </div>
                  <button class="ui primary button" type="submit">Login</button>
                </form>
              </div>
            </div>
          </div>
        `;
        this.render(theHtml, false);
      } else {
        gotoPage("AdminTable", null);
      }
    }
    async submitForm(ev) {
      ev.preventDefault();
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
        <div class="ui wide container">
          <!-- Header -->
          <div class="ui large top hidden menu">
            <div class="ui container">
              <div class="item">
                <h2>Admin for DOME Marketplace Onboarding</h2>
              </div>
              <div class="right menu">
                <div class="item">
                  <a
                    @click=${() => {
        pb.authStore.clear();
        location = location.href;
      }}
                    class="ui primary button"
                    >Log off</a
                  >
                </div>
              </div>
            </div>
          </div>

          <table id="myTable" class="ui celled table">
            <thead>
              <tr>
                <th rowspan="2">Time</th>
                <th colspan="3" data-dt-order="disable" class="dt-center">
                  Registrant
                </th>
                <th colspan="3" data-dt-order="disable" class="dt-center">
                  Company
                </th>
                <th colspan="6" data-dt-order="disable" class="dt-center">
                  LEAR
                </th>
              </tr>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Verified</th>
                <th>Name</th>
                <th>OrgID</th>
                <th>Address</th>
                <th>Email</th>
                <th>Name</th>
                <th>ID</th>
                <th>Mobile</th>
                <th>Street</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              ${records.map((record) => {
        console.log(record);
        return html`
                  <tr>
                    <td>${record.updated.substring(0, 19)}</td>
                    <td>${record.name}</td>
                    <td>${record.email}</td>
                    <td>${record.verified ? "Yes" : "No"}</td>
                    <td>${record.organization}</td>
                    <td>${record.organizationIdentifier}</td>
                    <td>
                      ${record.street} (${record.postalCode} - ${record.city})
                      ${record.country}
                    </td>
                    <td>${record.learEmail}</td>
                    <td>${record.learFirstName + " " + record.learLastName}</td>
                    <td>${record.learIdcard}</td>
                    <td>${record.learMobile}</td>
                    <td>${record.learStreet}</td>

                    <td>${record.learNationality}</td>
                  </tr>
                `;
      })}
            </tbody>
          </table>
        </div>
      `;
      this.render(theHtml, false);
      let table = new window.DataTable("#myTable", {
        responsive: true,
        scrollX: true,
        buttons: ["copy", "csv", "excel"],
        layout: {
          top1Start: "buttons"
        }
      });
    }
  }
);
