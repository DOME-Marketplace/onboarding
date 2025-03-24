// @ts-check

// @ts-ignore
const MHR = window.MHR;

import PocketBase from "../components/pocketbase.es.mjs";

console.log("ENVIRONMENT", window.domeEnvironment);
console.log("BUYER ONBOARDING API", window.onboardServer);
const pb = new PocketBase(window.onboardServer);

// Copy some globals to make code less verbose
let gotoPage = MHR.gotoPage;
let html = MHR.html;

// Check if the onboarding server is available
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
          <div class="row">
            <div class="col-4 mx-auto">
              <h2>Admin for DOME Marketplace Onboarding</h2>

              <h3>Login as administrator</h3>
              <form
                id="login-form"
                @submit=${(/** @type {SubmitEvent} */ ev) =>
                  this.submitForm(ev)}
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
            </div>
          </div>
        `;

        // @ts-ignore
        this.render(theHtml, false);
      } else {
        // Go directly to the form page
        gotoPage("AdminTable", null);
      }
    }

    async submitForm(ev) {
      ev.preventDefault();
      debugger;
      const authData = await pb
        .collection("admins")
        .authWithPassword(
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
        sort: "-created",
      });
      debugger;

      let theHtml = html`
        <h2>Admin for DOME Marketplace Onboarding</h2>

        <table id="myTable" class="display compact cell-border">
          <thead>
            <tr>
              <th rowspan=2 style="border: 1px solid rgba(0, 0, 0, 0.15);">Time</th>
              <th colspan="3" data-dt-order="disable" class="dt-center" style="border: 1px solid rgba(0, 0, 0, 0.15);">
                Registrant
              </th>
              <th colspan="6" data-dt-order="disable" class="dt-center" style="border: 1px solid rgba(0, 0, 0, 0.15);">
                Company
              </th>
              <th colspan="3" data-dt-order="disable" class="dt-center" style="border: 1px solid rgba(0, 0, 0, 0.15);">
                LEAR
              </th>
            </tr>
            <tr>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">Name</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">Email</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">Verified</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">Name</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">OrgID</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">Street</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">PO</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">City</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">Country</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">LEAREmail</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">LEARName</th>
              <th style="border: 1px solid rgba(0, 0, 0, 0.15);">Nationality</th>
            </tr>
          </thead>
          <tbody>
            ${records.map((record) => {
              return html`
                <tr>
                  <td>${record.updated.substring(0, 19)}</td>
                  <td>${record.name}</td>
                  <td>${record.email}</td>
                  <td>${record.verified ? "Yes" : "No"}</td>
                  <td>${record.organization}</td>
                  <td>${record.organizationIdentifier}</td>
                  <td>${record.street}</td>
                  <td>${record.postalCode}</td>
                  <td>${record.city}</td>
                  <td>${record.country}</td>
                  <td>${record.learEmail}</td>
                  <td>${record.learFirstName + " " + record.learLastName}</td>
                  <td>${record.learNationality}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      `;

      // @ts-ignore
      this.render(theHtml, false);

      let table = new window.DataTable("#myTable", {
        responsive: true,
        scrollX: true,
        buttons: ["copy", "csv", "excel", "pdf", "print"],
        layout: {
          top1Start: "buttons",
        },
        columnDefs: [{ className: "dt-center", targets: ["_all"] }],
      });
    }
  }
);
