// @ts-check

import PocketBase from "../components/pocketbase.es.mjs";

let onboardServer = "http://localhost:8090";

const pb = new PocketBase(onboardServer);

// Copy some globals to make code less verbose

let gotoPage = window.MHR.gotoPage;
let goHome = window.MHR.goHome;
let storage = window.MHR.storage;
let html = window.MHR.html;
let cleanReload = window.MHR.cleanReload;

MHR.register(
  "BuyerOnboardingHome",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }

    async enter() {
      var theHtml;

      // Chech if we are logged in
      const logedIn = pb.authStore.isValid;

      // If we are logedin, just show the data about the registration
      if (logedIn) {
        gotoPage("BuyerOnboardingShowData", null);
        return;
      }

      let params = new URLSearchParams(document.location.search);
      let page = params.get("page");
      if (page == "login") {
        gotoPage("BuyerOnboardingLogin", null);
        return;
      }
      if (page == "verify") {
        gotoPage("BuyerOnboardingVerify", null);
        return;
      }
      if (page == "otp") {
        gotoPage("BuyerOnboardingOTP", null);
        return;
      }

      gotoPage("BuyerOnboardingForm", null);
      return;

      // Authenticate with the server using implicitly the certificate in the TLS session.
      try {
        const authData = await pb.send("/apisigner/loginwithcert");

        await pb.collection("buyers").requestVerification("jesus@alastria.io");

        if (authData.token) {
          // We receive the token if the user was already registered, including a verified email

          // Store the token and user in the auth store and go to display the available certs
          pb.authStore.save(authData.token, authData.record);

          console.log(authData);
          // Redirect the user to the DOME Issuer portal
          //@ts-ignore
          window.location = "https://issuer.dome-marketplace.eu/";
          return;
        } else {
          if (authData.not_verified) {
            debugger;
            // The signer is waiting confirmation of the email
            console.log("waiting for confirmation");

            gotoPage("BuyerWaitingConfirmation", { authData: authData });
            // Reload the application with a clean URL, going to home
            //@ts-ignore
            // window.location = window.location.origin

            return;
          }

          // The certificate was not yet in the db, ask user to register
          gotoPage("BuyerOnboardingForm", { authData: authData });

          return;
        }
      } catch (error) {
        console.log("error in loginwithcert:", error);

        if (error.status == 401) {
          gotoPage("ErrorPage", {
            title: "An eIDAS certificate is required",
            msg: "We need that you provide an eIDAS certificate to enable an easy and fast onboarding process.",
          });
          return;
        }

        // Other errors are displayed as usual
        gotoPage("ErrorPage", {
          title: "Error authenticating",
          msg: error.message,
        });
        return;
      }
    }
  }
);

/**
 * @typedef {Object} AuthData
 * @property {string} organization_identifier
 * @property {string} organization
 * @property {string} serial_number
 * @property {string} common_name
 * @property {string} country
 * @property {string} given_name
 * @property {string} surname
 * @property {string} email_address
 * @property {string} locality
 * @property {string} postal_code
 * @property {string} street_address
 */

MHR.register(
  "BuyerOnboardingShowData",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }

    async enter(pageData) {
      debugger;

      var theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap"
                  >DOME MARKETPLACE</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Onboarding in DOME
            </div>
            <div class="text-jumbo blinker-bold">as a Buyer of services.</div>
            <p class="w3-xlarge">
              This is the data for your current onboarding registration.
            </p>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <!-- Form -->
          <div class="dome-content">
            <form
              name="theform"
              @submit=${(e) => this.validateForm(e)}
              id="formElements"
              class="w3-margin-bottom"
            >
              ${LegalRepresentativeDisplay()} ${CompanyForm()} ${LEARForm()}

              <div class="w3-bar w3-center">
                <button
                  class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                  title="Submit and create documents"
                >
                  Submit and create documents
                </button>
                <button
                  @click=${this.fillTestData}
                  class="w3-btn dome-color border-2 w3-round-large w3-margin-left blinker-semibold"
                >
                  Fill with test data (only for testing)
                </button>
              </div>
            </form>

            <div
              class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom"
            >
              <div class="w3-container">
                <p>
                  Click the "<b>Submit and create documents</b>" button above to
                  create the documents automatically including the data you
                  entered.
                </p>
                <p>
                  If you are not yet ready and want to see how the final
                  documents look like, click the button "<b
                    >Fill with test data</b
                  >" and then the "<b>Submit and create documents</b>" button to
                  create the documents with test data.
                </p>
              </div>
            </div>
          </div>
        </div>
      `;

      // @ts-ignore
      this.render(theHtml, false);
    }

    async fillTestData(ev) {
      ev.preventDefault();

      // document.forms['theform'].elements["LegalRepFirstName"].value = "Jesus"
      // document.forms['theform'].elements["LegalRepLastName"].value = "Ruiz"
      // document.forms['theform'].elements["LegalRepNationality"].value = "Spanish"
      // document.forms['theform'].elements["LegalRepIDNumber"].value = "24676932R"
      document.forms["theform"].elements["LegalRepCommonName"].value =
        "Jesus Ruiz";
      document.forms["theform"].elements["LegalRepEmail"].value =
        "jesus@alastria.io";

      document.forms["theform"].elements["CompanyName"].value =
        "Air Quality Cloud";
      document.forms["theform"].elements["CompanyStreetName"].value =
        "C/ Academia 54";
      document.forms["theform"].elements["CompanyCity"].value = "Madrid";
      document.forms["theform"].elements["CompanyPostal"].value = "28654";
      document.forms["theform"].elements["CompanyCountry"].value = "Spain";
      document.forms["theform"].elements["CompanyOrganizationID"].value =
        "VATES-B35664875";

      // document.forms['theform'].elements["LEARFirstName"].value = "John"
      // document.forms['theform'].elements["LEARLastName"].value = "Doe"
      // document.forms['theform'].elements["LEARNationality"].value = "Spanish"
      // document.forms['theform'].elements["LEARIDNumber"].value = "56332876F"
      // document.forms['theform'].elements["LEARPostalAddress"].value = "C/ Academia 54, Madrid - 28654, Spain"
      // document.forms['theform'].elements["LEAREmail"].value = "john.doe@airquality.com"
      // document.forms['theform'].elements["LEARMobilePhone"].value = "+34876549022"
    }

    async validateForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};

      // @ts-ignore
      any("form input").classRemove("w3-lightred");
      // @ts-ignore
      any("form input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);

      // Prepare data to be sent to the server. The password is not used, but the server requires it (for the moment)
      const data = {
        email: form.LegalRepEmail,
        emailVisibility: true,

        commonName: form.LegalRepCommonName,
        organization: form.CompanyName,
        street: form.CompanyStreetName,
        city: form.CompanyCity,
        postalCode: form.CompanyPostal,
        country: form.CompanyCountry,
        organizationIdentifier: form.CompanyOrganizationID,
        password: "12345678",
        passwordConfirm: "12345678",
      };

      // Create a record for the legal representative in the server
      try {
        const record = await pb.collection("buyers").create(data);
        console.log(record);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message,
        });
        return;
      }

      // Request automatically a verification of the email
      try {
        console.log("Requesting verification");
        var result = await pb
          .collection("buyers")
          .requestVerification(form.LegalRepEmail);
        console.log("After requesting verification:", result);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error requesting verification",
          msg: error.message,
        });
        return;
      }

      alert(
        "Registration requested. Please check your email for confirmation."
      );

      // Reload the application with a clean URL, going to home
      //@ts-ignore
      // window.location = window.location.origin
      goHome();
    }
  }
);

MHR.register(
  "BuyerOnboardingForm",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }

    async enter(pageData) {
      debugger;

      var theHtml = html`
      <!-- Header -->
      <div class="dome-header">
        <div class="dome-content">
          <div class="w3-bar">
            <div class="w3-bar-item padding-right-0">
              <a href="#">
                <img src="assets/logos/DOME_Icon_White.svg" alt="DOME Icon" style="width:100%;max-height:32px">
              </a>
            </div>
            <div class="w3-bar-item">
              <span class="blinker-semibold w3-xlarge nowrap">DOME MARKETPLACE</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Jumbo -->
      <div class="bg-cover" style="background-image: url(assets/images/bg_1_shadow.png);">
        <div class="dome-content w3-text-white">
          <div class="text-jumbo blinker-bold w3-padding-top-48">Onboarding in DOME</div>
          <div class="text-jumbo blinker-bold">as a Buyer of services.</div>
          <p class="w3-xlarge">The Marketplace is a digital platform that enables CSPs to offer cloud and edge computing
            services to customers across Europe. The main goal of this onboarding process is the creation of an operating
            account for your company so you can start buying offerings from CSPs in the Marketplace.
          </p>
        </div>
        <div class="w3-padding-32"></div>
      </div>

      <div class="w3-padding-32" style="background-color: #EDF2FA;">

        <!-- Process structure -->
        <div class="w3-card-4 dome-content w3-round-large w3-white">
          <div class="w3-container">
            <h2>The process is structured in three main steps</h2>

            <div class="w3-row-padding">

              <div class="w3-third">
                <div class="parent">
                  <div class="child padding-right-8">
                    <span class="material-symbols-outlined dome-color w3-xxxlarge">
                      counter_1
                    </span>
                  </div>
                  <div class="child padding-right-24">
                    <p>Provide all the information required in the forms below and
                      acceptance of the terms and conditions here
                      <a target="_blank"
                        href="https://knowledgebase.dome-marketplace.eu/shelves/company-onboarding-process">
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div class="w3-third">
                <div class="parent">
                  <div class="child padding-right-8">
                    <span class="material-symbols-outlined dome-color w3-xxxlarge">
                      counter_2
                    </span>
                  </div>
                  <div class="child padding-right-24">
                    <p>Verification of the email used to perform onboarding</p>
                  </div>
                </div>
              </div>

              <div class="w3-third">
                <div class="parent">
                  <div class="child padding-right-8">
                    <span class="material-symbols-outlined dome-color w3-xxxlarge">
                      counter_3
                    </span>
                  </div>
                  <div class="child padding-right-24">
                    <p>Generation of the verifiable credential for the Legal Entity Appointed Representative (LEAR)</p>
                  </div>
                </div>
              </div>

            </div>

            <h4>Upon the generation of the LEAR verifiable credential, the company account is fully operational and products
              and services can be purchased.
            </h4>
          </div>

        </div>
      </div>

      <!-- Eligibility -->
      <div class="w3-panel dome-content">
        <h1>Eligibility Verification</h1>

        <div class="w3-row">
          <div class="w3-half">
            <p class="w3-large padding-right-large">Before launching the onboarding process, make sure that you meet the
              following criteria:</p>
          </div>
          <div class="w3-half">

            <div class="w3-cell-row w3-padding-16">
              <div class="w3-cell w3-cell-top padding-top-small padding-right-4">
                <span class="material-symbols-outlined dome-color">
                  check_circle
                </span>
              </div>
              <div class="w3-cell w3-cell-top">
                <div class="w3-xlarge blinker-semibold">You are a legal entity duly registered in an EU country.</div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <div class="w3-padding-32" style="background-color: #EDF2FA;">

        <!-- Instructions -->
        <div class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom">

          <div class="parent">
            <div class="child">
              <div class="w3-panel">
                <h1>Filling Out Forms</h1>
                <p class="w3-large">
                  In this page you will find a form with three sections. Fill in all the fields (all of them are required),
                  making sure to use Latin characters.
                </p>
                <p class="w3-large">
                  The information you enter in the forms will be used to generate two of the documents required for the
                  onboarding process. The whole process is described in more detail in the DOME knowledge base: Company
                  Onboarding Process. You can read the description in the knowledgebase and come back here whenever you
                  want.
                </p>
                <p class="w3-large">
                  The forms are below. Please, click the "Submit and create documents" after filling all the fields.
                </p class="w3-large">
                <p class="w3-large">
                  For testing purposes, you can click the "Fill with test data" button to create and print documents with
                  test data but with the final legal prose, so they can be reviewed by your legal department in advance of
                  creating the real documents.</p>
                </p>
              </div>
            </div>
            <div class="">
              <img src="assets/images/form.png" alt="DOME Icon" style="max-width:450px">
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="dome-content">
          <form
          name="onboarding_form"
          id="onboarding_form"
          @submit=${(/** @type {SubmitEvent} */ ev) => this.submitForm(ev)}
          class="w3-margin-bottom"
          >

            ${LegalRepresentativeForm()}

            ${CompanyForm()}

            ${LEARForm()}

            <div class="w3-bar w3-center">
              <button class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                title="Submit and create documents">Submit and create documents
              </button>
              <a @click=${this.fillTestData}
                class="w3-btn dome-color border-2 w3-round-large w3-margin-left blinker-semibold">Fill with test data (only
                for
                testing)</button>
              </a>
            </div>

          </form>

          <div class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom">
            <div class="w3-container">

              <p>
                Click the "<b>Submit and create documents</b>" button above to create the documents automatically including
                the data you entered.
              </p>
              <p>
                If you are not yet ready and want to see how the final documents look like, click the button "<b>Fill with
                  test data</b>" and then the "<b>Submit and create documents</b>" button to create the documents with test
                data.
              </p>

            </div>

          </div>


        </div>

      </div>
      `;

      // @ts-ignore
      this.render(theHtml, false);
    }

    async fillTestData(ev) {
      ev.preventDefault();

      // document.forms['onboarding_form'].elements["LegalRepFirstName"].value = "Jesus"
      // document.forms['onboarding_form'].elements["LegalRepLastName"].value = "Ruiz"
      // document.forms['onboarding_form'].elements["LegalRepNationality"].value = "Spanish"
      // document.forms['onboarding_form'].elements["LegalRepIDNumber"].value = "24676932R"
      document.forms["onboarding_form"].elements["LegalRepCommonName"].value =
        "Jesus Ruiz";
      document.forms["onboarding_form"].elements["LegalRepEmail"].value =
        "jesus@alastria.io";

      document.forms["onboarding_form"].elements["CompanyName"].value =
        "Air Quality Cloud";
      document.forms["onboarding_form"].elements["CompanyStreetName"].value =
        "C/ Academia 54";
      document.forms["onboarding_form"].elements["CompanyCity"].value =
        "Madrid";
      document.forms["onboarding_form"].elements["CompanyPostal"].value =
        "28654";
      document.forms["onboarding_form"].elements["CompanyCountry"].value =
        "Spain";
      document.forms["onboarding_form"].elements[
        "CompanyOrganizationID"
      ].value = "VATES-B35664875";

      document.forms["onboarding_form"].elements["LEARFirstName"].value =
        "John";
      document.forms["onboarding_form"].elements["LEARLastName"].value = "Doe";
      document.forms["onboarding_form"].elements["LEARNationality"].value =
        "Spanish";
      document.forms["onboarding_form"].elements["LEARIDNumber"].value =
        "56332876F";
      document.forms["onboarding_form"].elements["LEARPostalAddress"].value =
        "C/ Academia 54, Madrid - 28654, Spain";
      document.forms["onboarding_form"].elements["LEAREmail"].value =
        "john.doe@airquality.com";
      document.forms["onboarding_form"].elements["LEARMobilePhone"].value =
        "+34876549022";
    }

    async submitForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};

      // @ts-ignore
      any("#onboarding_form input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);

      // Prepare data to be sent to the server. The password is not used, but the server requires it (for the moment)
      const data = {
        email: form.LegalRepEmail,
        emailVisibility: true,
        name: form.LegalRepCommonName,

        organizationIdentifier: form.CompanyOrganizationID,
        organization: form.CompanyName,
        street: form.CompanyStreetName,
        city: form.CompanyCity,
        postalCode: form.CompanyPostal,
        country: form.CompanyCountry,

        learFirstName: form.LEARFirstName,
        learLastName: form.LEARLastName,
        learNationality: form.LEARNationality,
        learIdcard: form.LEARIDNumber,
        learStreet: form.LEARPostalAddress,
        learEmail: form.LEAREmail,
        learMobile: form.LEARMobilePhone,

        password: "12345678",
        passwordConfirm: "12345678",
      };

      // Create a record for the company in the server
      try {
        const record = await pb.collection("buyers").create(data);
        console.log(record);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message,
        });
        return;
      }

      // Request an OTP
      try {
        const record = await pb
          .collection("buyers")
          .requestOTP(form.LegalRepEmail);
        console.log(record);
        gotoPage("BuyerOnboardingOTP", {
          email: form.LegalRepEmail,
          otpId: record.otpId,
        });
        return;
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message,
        });
        return;
      }

      // // Request automatically a verification of the email
      // try {
      //   console.log("Requesting verification");
      //   var result = await pb
      //     .collection("buyers")
      //     .requestVerification(form.LegalRepEmail);
      //   console.log("After requesting verification:", result);
      // } catch (error) {
      //   myerror(error);
      //   gotoPage("ErrorPage", {
      //     title: "Error requesting verification",
      //     msg: error.message,
      //   });
      //   return;
      // }

      alert(
        "Registration requested. Please check your email for confirmation."
      );

      // Reload the application with a clean URL, going to home
      //@ts-ignore
      // window.location = window.location.origin
      goHome();
    }
  }
);

/**
 * @returns {import("uhtml").Renderable}
 */
function PersonOnboardingForm() {
  return html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>RegisterLegal representative of the company</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>
            We need information identifying the legal representative of the
            company. The name and serial number are read-only fields as they
            come from the certificate.
          </p>
          <p>
            Please, enter your email to receive important messages from us.
            After submitting the form, you will receive a message for
            confirmation.
          </p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>Name and Surname</b></label>
              <input
                name="LegalRepCommonName"
                class="w3-input w3-border"
                type="text"
                required
              />
            </p>

            <p>
              <label><b>Email</b></label>
              <input
                name="LegalRepEmail"
                class="w3-input w3-border"
                type="text"
                placeholder="Email"
                required
              />
            </p>

            <p>
              <b>IMPORTANT:</b> your onboarding request can only be processed
              after you confirm your email address. After you submit the
              onboarding request, you will receive a message from us at the
              email address you specify here, allowing you to confirm it.
            </p>
            <p>
              We send the email immediately, but depending on the email server
              configuration, you may require some minutes before receiving the
              message. Also, if you do not receive the email in a reasonable
              time, please look in your spam inbox, just in case your email
              server has clasified it as such.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * @returns {import("uhtml").Renderable}
 */
function LegalRepresentativeForm() {
  return html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Person driving the onboarding process</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>
            We need information identifying the person performing the onboarding
            process on behalf of the company.
          </p>
          <p>
            Your email will be used to receive important messages from us. After
            submitting the form, you will receive a message for confirmation.
          </p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>Name and Surname</b></label>
              <input
                name="LegalRepCommonName"
                class="w3-input w3-border"
                type="text"
                required
              />
            </p>

            <p>
              <label><b>Email</b></label>
              <input
                name="LegalRepEmail"
                class="w3-input w3-border"
                type="text"
                placeholder="Email"
                required
              />
            </p>

            <p>
              <b>IMPORTANT:</b> your onboarding request can only be processed
              after you confirm your email address. After you submit the
              onboarding request, you will receive a message from us at the
              email address you specify here, allowing you to confirm it.
            </p>
            <p>
              We send the email immediately, but depending on the email server
              configuration, you may require some minutes before receiving the
              message. Also, if you do not receive the email in a reasonable
              time, please look in your spam inbox, just in case your email
              server has clasified it as such.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * @returns {import("uhtml").Renderable}
 */
function LegalRepresentativeDisplay(personData) {
  return html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Person performing onboarding</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>This is the information we have about you.</p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>Name and Surname</b></label>
              <input
                name="LegalRepCommonName"
                class="w3-input w3-border"
                type="text"
                required
              />
            </p>

            <p>
              <label><b>Email</b></label>
              <input
                name="LegalRepEmail"
                class="w3-input w3-border"
                type="text"
                placeholder="Email"
                required
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * @returns {import("uhtml").Renderable}
 */
function CompanyForm() {
  var theHtml = html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Company information</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>
            We also need information about the company so we can register it in
            DOME.
          </p>
          <p>
            The name must be the official name of the company as it appears in
            the records of incorporation of your company. The address must be
            that of the official place of incorporation of your company.
          </p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>Official Name</b></label>
              <input
                name="CompanyName"
                class="w3-input w3-border"
                type="text"
                placeholder="Name"
                required
              />
            </p>

            <p>
              <label><b>Street name and number</b></label>
              <input
                name="CompanyStreetName"
                class="w3-input w3-border"
                type="text"
                placeholder="Street name and number"
                required
              />
            </p>

            <p>
              <label><b>City</b></label>
              <input
                name="CompanyCity"
                class="w3-input w3-border"
                type="text"
                placeholder="City"
                required
              />
            </p>

            <p>
              <label><b>Postal code</b></label>
              <input
                name="CompanyPostal"
                class="w3-input w3-border"
                type="text"
                placeholder="Postal code"
                required
              />
            </p>

            <p>
              <label><b>Country</b></label>
              <input
                name="CompanyCountry"
                class="w3-input w3-border"
                type="text"
                placeholder="Country"
                required
              />
            </p>

            <p>
              <label><b>Tax identifier</b></label>
              <input
                name="CompanyOrganizationID"
                class="w3-input w3-border"
                type="text"
                placeholder="VAT number"
                required
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
  return theHtml;
}

function LEARForm() {
  var theHtml = html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Information about the LEAR</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>
            This section identifies an employee of the company who will act as
            the LEAR.
          </p>
          <p>
            The LEAR is the Legal Entity Appointed Representative. Do not
            confuse with the Legal Representative, who has to appear in the
            official records in the commercial registry or equivalent
            institution in your jurisdiction. Instead, the LEAR can be any
            person who is authorised by the company to interact with DOME and
            act on behalf of the company. There is specific information about
            the LEAR in the knowledge base.
          </p>
          <p>
            Of course, the Legal Representative can appoint him/herself as the
            LEAR for DOME, if this is what is suitable for you.
          </p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>First name</b></label>
              <input
                name="LEARFirstName"
                class="w3-input w3-border"
                type="text"
                placeholder="First name"
                required
              />
            </p>

            <p>
              <label><b>Last name</b></label>
              <input
                name="LEARLastName"
                class="w3-input w3-border"
                type="text"
                placeholder="Last name"
                required
              />
            </p>

            <p>
              <label><b>Nationality</b></label>
              <input
                name="LEARNationality"
                class="w3-input w3-border"
                type="text"
                placeholder="Nationality"
                required
              />
            </p>

            <p>
              <label><b>ID card number</b></label>
              <input
                name="LEARIDNumber"
                class="w3-input w3-border"
                type="text"
                placeholder="ID card number"
              />
            </p>

            <p>
              <label><b>Complete postal professional address</b></label>
              <input
                name="LEARPostalAddress"
                class="w3-input w3-border"
                type="text"
                placeholder="Complete postal professional address"
                required
              />
            </p>

            <p>
              <label><b>Email</b></label>
              <input
                name="LEAREmail"
                class="w3-input w3-border"
                type="text"
                placeholder="Email"
                required
              />
            </p>

            <p>
              <label><b>Mobile phone</b></label>
              <input
                name="LEARMobilePhone"
                class="w3-input w3-border"
                type="text"
                placeholder="Mobile phone"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
  return theHtml;
}

MHR.register(
  "BuyerWaitingConfirmation",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }

    async enter(pageData) {
      debugger;

      const authData = pageData.authData;

      const organization_identifier = authData.organization_identifier;
      const organization = authData.organization;
      const serial_number = authData.serial_number;
      const common_name = authData.common_name;

      // A certificate without an organization identifier is a personal certificate.
      // A certificate with both organizationIdentifier and serialNumber is a legal representative certificate.
      // A certificate with organizationIdentifier and without serialNumber is a seal certificate.
      var certificateType = "personal";
      if (organization_identifier) {
        if (serial_number) {
          certificateType = "legalRepresentative";
        } else {
          certificateType = "seal";
        }
      }

      var theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap"
                  >DOME MARKETPLACE</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Waitng for confirmation of your email.
            </div>
            <p class="w3-xlarge">
              We need that you confirm the email address that you provided,
              please look at your inbox. Below you see the information that you
              submitted, for your reference. Once the email is verified,
              refreshing this page will confirm the status.
            </p>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <!-- Form -->
          <div class="dome-content">
            <div class="w3-margin-bottom">
              ${LegalRepresentativeForm()} ${CompanyForm()}
            </div>

            <div
              class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom"
            >
              <div class="w3-container">
                <p>
                  Once you verify your email address, refresh this screen to see
                  updates in the onboarding process.
                </p>
              </div>
            </div>
          </div>
        </div>
      `;

      // @ts-ignore
      this.render(theHtml, false);
    }

    async fillTestData(ev) {
      ev.preventDefault();

      // document.forms['theform'].elements["LegalRepFirstName"].value = "Jesus"
      // document.forms['theform'].elements["LegalRepLastName"].value = "Ruiz"
      // document.forms['theform'].elements["LegalRepNationality"].value = "Spanish"
      // document.forms['theform'].elements["LegalRepIDNumber"].value = "24676932R"
      document.forms["theform"].elements["LegalRepEmail"].value =
        "jesus@alastria.io";

      // document.forms['theform'].elements["CompanyName"].value = "Air Quality Cloud"
      document.forms["theform"].elements["CompanyStreetName"].value =
        "C/ Academia 54";
      document.forms["theform"].elements["CompanyCity"].value = "Madrid";
      document.forms["theform"].elements["CompanyPostal"].value = "28654";
      // document.forms['theform'].elements["CompanyCountry"].value = "Spain"
      // document.forms['theform'].elements["CompanyOrganizationID"].value = "VATES-B35664875"

      // document.forms['theform'].elements["LEARFirstName"].value = "John"
      // document.forms['theform'].elements["LEARLastName"].value = "Doe"
      // document.forms['theform'].elements["LEARNationality"].value = "Spanish"
      // document.forms['theform'].elements["LEARIDNumber"].value = "56332876F"
      // document.forms['theform'].elements["LEARPostalAddress"].value = "C/ Academia 54, Madrid - 28654, Spain"
      // document.forms['theform'].elements["LEAREmail"].value = "john.doe@airquality.com"
      // document.forms['theform'].elements["LEARMobilePhone"].value = "+34876549022"
    }

    async validateForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};

      // @ts-ignore
      any("form input").classRemove("w3-lightred");
      // @ts-ignore
      any("form input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);

      // Prepare data to be sent to the server. The password is not used, but the server requires it (for the moment)
      const data = {
        email: form.LegalRepEmail,
        emailVisibility: true,

        password: "12345678",
        passwordConfirm: "12345678",
      };

      // Create a record for the legal representative in the server
      try {
        const record = await pb.collection("signers").create(data);
        console.log(record);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message,
        });
        return;
      }

      // Request automatically a verification of the email
      try {
        console.log("Requesting verification");
        var result = await pb
          .collection("signers")
          .requestVerification(form.LegalRepEmail);
        console.log("After requesting verification:", result);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error requesting verification",
          msg: error.message,
        });
        return;
      }

      alert(
        "Registration requested. Please check your email for confirmation."
      );

      // Reload the application with a clean URL, going to home
      //@ts-ignore
      window.location = window.location.origin;
    }
  }
);

// LOGIN form
MHR.register(
  "BuyerOnboardingLogin",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }

    async enter(pageData) {
      debugger;

      var theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap"
                  >DOME MARKETPLACE</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Onboarding in DOME
            </div>
            <div class="text-jumbo blinker-bold">as a Buyer of services.</div>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <!-- Form -->
          <div class="dome-content">
            <form
              name="loginform"
              @submit=${(/** @type {SubmitEvent} */ ev) => this.submitForm(ev)}
              id="loginform"
              class="w3-margin-bottom"
            >
              <div class="card w3-card-2 w3-white">
                <div class="w3-container">
                  <h1>Enter your registered email</h1>
                </div>

                <div class="w3-row">
                  <div class="w3-quarter w3-container">
                    <p>
                      Please, enter your email to receive important messages
                      from us. After submitting the form, you will receive a
                      message for confirmation.
                    </p>
                  </div>

                  <div class="w3-rest w3-container">
                    <div class="w3-panel w3-card-2  w3-light-grey">
                      <p>
                        <label><b>Email</b></label>
                        <input
                          name="LegalRepEmail"
                          class="w3-input w3-border"
                          type="text"
                          placeholder="Email"
                          required
                        />
                      </p>

                      <p>
                        <b>IMPORTANT:</b> your onboarding request can only be
                        processed after you confirm your email address. After
                        you submit the onboarding request, you will receive a
                        message from us at the email address you specify here,
                        allowing you to confirm it.
                      </p>
                      <p>
                        We send the email immediately, but depending on the
                        email server configuration, you may require some minutes
                        before receiving the message. Also, if you do not
                        receive the email in a reasonable time, please look in
                        your spam inbox, just in case your email server has
                        clasified it as such.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="w3-bar w3-center">
                <button
                  id="login_button"
                  class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                  style="width:30%"
                  title="Login"
                >
                  Login
                </button>
                <a
                  class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                  style="width:30%"
                  title="Register email"
                >
                  Register email
                </a>
              </div>
            </form>

            <!-- Information about the form -->
            <div
              class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom"
            >
              <div class="w3-container">
                <p>
                  Click the "<b>Submit and create documents</b>" button above to
                  create the documents automatically including the data you
                  entered.
                </p>
                <p>
                  If you are not yet ready and want to see how the final
                  documents look like, click the button "<b
                    >Fill with test data</b
                  >" and then the "<b>Submit and create documents</b>" button to
                  create the documents with test data.
                </p>
              </div>
            </div>
          </div>
        </div>
      `;

      // Display the form
      // @ts-ignore
      this.render(theHtml, false);
    }

    /**
     * @param {SubmitEvent} ev
     */
    async submitForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};

      ev.target;

      // @ts-ignore
      any("#loginform input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);

      // Login with an OTP
      try {
        const record = await pb
          .collection("buyers")
          .requestOTP(form.LegalRepEmail);
        console.log(record);
        gotoPage("BuyerOnboardingOTP", {
          email: form.LegalRepEmail,
          otpId: record.otpId,
        });
        return;
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message,
        });
        return;
      }
    }
  }
);

// Waiting for the OTP form
MHR.register(
  "BuyerOnboardingOTP",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }

    /**
     * @param {{email: string, otpId: string}} pageData
     */
    async enter(pageData) {
      debugger;

      var theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap"
                  >DOME MARKETPLACE</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Onboarding in DOME
            </div>
            <div class="text-jumbo blinker-bold">as a Buyer of services.</div>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <!-- Form -->
          <div class="dome-content">
            <form
              name="otpform"
              @submit=${(/** @type {SubmitEvent} */ ev) => this.submitForm(ev)}
              id="loginform"
              class="w3-margin-bottom"
            >
              <div class="card w3-card-2 w3-white">
                <div class="w3-container">
                  <h1>Confirm your email</h1>
                </div>

                <div class="w3-row">
                  <div class="w3-quarter w3-container">
                    <p>
                      Please, enter the code that you must have received in your
                      email from us.
                    </p>
                    <p>
                      After submitting the form, you will receive a message for
                      confirmation.
                    </p>
                  </div>

                  <div class="w3-rest w3-container">
                    <div class="w3-panel w3-card-2  w3-light-grey">
                      <p>
                        <label><b>Email to verify</b></label>
                        <input
                          name="LegalRepEmail"
                          class="w3-input w3-border"
                          type="text"
                          placeholder="Email"
                          value=${pageData.email}
                          readonly
                        />
                      </p>
                      <p>
                        <label><b>Enter the code you received</b></label>
                        <input
                          name="ReceivedOTP"
                          class="w3-input w3-border"
                          type="text"
                          placeholder="OTP"
                          required
                        />
                      </p>
                      <input
                        name="otpId"
                        type="hidden"
                        value=${pageData.otpId}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="w3-bar w3-center">
                <button
                  id="login_button"
                  class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                  style="width:30%"
                  title="Confirm"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Display the form
      // @ts-ignore
      this.render(theHtml, false);
    }

    /**
     * @param {SubmitEvent} ev
     */
    async submitForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};

      ev.target;

      // @ts-ignore
      any("#loginform input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);

      // Perform the authentication with the received OTP
      try {
        const authData = await pb
          .collection("buyers")
          .authWithOTP(form.otpId, form.ReceivedOTP);
        console.log(authData);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message,
        });
        return;
      }

      // Reload the application with a clean URL, going to home
      //@ts-ignore
      // window.location = window.location.origin
      goHome();
    }
  }
);

MHR.register(
  "BuyerOnboardingVerify",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }

    async enter(pageData) {
      debugger;

      let params = new URLSearchParams(document.location.search);
      let verificationToken = params.get("token");
      if (!verificationToken) {
        gotoPage("MessagePage", {
          title: "Token not provided",
          msg: "The page has not provided a verification token",
        });
        return;
      }

      // Try to verify the email with the token
      try {
        const result = await pb
          .collection("buyers")
          .confirmVerification(verificationToken);
        console.log("Result:", result);
      } catch (error) {
        console.log("Error:", error);
        gotoPage("MessagePage", {
          title: "Failed verification",
          msg: error.message,
        });
        return;
      }

      var theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap"
                  >DOME MARKETPLACE</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Verification of email.
            </div>
            <p class="w3-xlarge">
              The Marketplace is a digital platform that enables CSPs to offer
              cloud and edge computing services to customers across Europe. The
              main goal of this onboarding process is the creation of an
              operating account for your company so you can start buying
              offerings from CSPs in the Marketplace.
            </p>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <!-- Form -->
          <div class="dome-content">
            <form
              name="theform"
              @submit=${(e) => this.validateForm(e)}
              id="formElements"
              class="w3-margin-bottom"
            >
              ${LegalRepresentativeForm()} ${CompanyForm()}

              <div class="w3-bar w3-center">
                <button
                  class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                  title="Register email"
                >
                  Register email
                </button>
              </div>
            </form>

            <div
              class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom"
            >
              <div class="w3-container">
                <p>
                  Click the "<b>Submit and create documents</b>" button above to
                  create the documents automatically including the data you
                  entered.
                </p>
                <p>
                  If you are not yet ready and want to see how the final
                  documents look like, click the button "<b
                    >Fill with test data</b
                  >" and then the "<b>Submit and create documents</b>" button to
                  create the documents with test data.
                </p>
              </div>
            </div>
          </div>
        </div>
      `;

      // @ts-ignore
      this.render(theHtml, false);
    }

    async validateForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};

      // @ts-ignore
      any("form input").classRemove("w3-lightred");
      // @ts-ignore
      any("form input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);

      // Prepare data to be sent to the server. The password is not used, but the server requires it (for the moment)
      const data = {
        email: form.LegalRepEmail,
        emailVisibility: true,

        commonName: form.LegalRepCommonName,
        organization: form.CompanyName,
        street: form.CompanyStreetName,
        city: form.CompanyCity,
        postalCode: form.CompanyPostal,
        country: form.CompanyCountry,
        organizationIdentifier: form.CompanyOrganizationID,
        password: "12345678",
        passwordConfirm: "12345678",
      };

      // Create a record for the legal representative in the server
      try {
        const record = await pb.collection("buyers").create(data);
        console.log(record);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message,
        });
        return;
      }

      // Request automatically a verification of the email
      try {
        console.log("Requesting verification");
        var result = await pb
          .collection("buyers")
          .requestVerification(form.LegalRepEmail);
        console.log("After requesting verification:", result);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error requesting verification",
          msg: error.message,
        });
        return;
      }

      alert(
        "Registration requested. Please check your email for confirmation."
      );

      // Reload the application with a clean URL, going to home
      //@ts-ignore
      // window.location = window.location.origin
      goHome();
    }
  }
);
