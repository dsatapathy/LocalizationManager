import React, { useState } from "react";
import "./LocalizationManager.css";

const LocalizationManager = () => {
  const [newMessage, setNewMessage] = useState({ code: "", message: "", module: "" });
  const [englishMessages, setEnglishMessages] = useState([]); // For en_IN
  const [odiaMessages, setOdiaMessages] = useState([]); // For od_IN
  const [environment, setEnvironment] = useState("UAT");
  const [translatedText, setTranslatedText] = useState("");

  const modules = ["rainmaker-bpa", "rainmaker-common"];

  const handleAddMessage = async () => {
    if (!newMessage.code || !newMessage.message || !newMessage.module) {
      alert("Please fill all fields");
      return;
    }

    // Create English entry
    const englishEntry = { locale: "en_IN", code: newMessage.code, message: newMessage.message, module: newMessage.module };

    // Translate to Odia
    const translatedMessage = await translateText(newMessage.message, "or");
    const odiaEntry = { locale: "od_IN", code: newMessage.code, message: translatedMessage, module: newMessage.module };

    // Add both entries
    setEnglishMessages([...englishMessages, englishEntry]);
    setOdiaMessages([...odiaMessages, odiaEntry]);

    // Reset input
    setNewMessage({ code: "", message: "", module: "" });
  };
  const getAuthTokenUAT = async () => {
    try {
      const authResponse = await fetch("https://sujog-dev.odisha.gov.in/user/oauth/token", {
        method: "POST",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic ZWdvdi11c2VyLWNsaWVudDplZ292LXVzZXItc2VjcmV0"
        },
        body: new URLSearchParams({
          username: "systemAdmin",
          password: "Dev@123#",
          grant_type: "password",
          scope: "read",
          tenantId: "od.cuttack",
          userType: "EMPLOYEE"
        })
      });

      const authResult = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(authResult.error_description || "Unknown error");
      }

      console.log("UAT Auth Token:", authResult.access_token);
      return authResult.access_token;
    } catch (error) {
      alert("Failed to get UAT auth token: " + error.message);
      return null;
    }
  };

  const getAuthTokenPROD = async () => {
    try {
      const authResponse = await fetch("https://sujog.odisha.gov.in/user/oauth/token", {
        method: "POST",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic ZWdvdi11c2VyLWNsaWVudDplZ292LXVzZXItc2VjcmV0"
        },
        body: new URLSearchParams({
          username: "state_admin",
          password: "Zaq23f@#8jf$",
          grant_type: "password",
          scope: "read",
          tenantId: "od.cuttack",
          userType: "EMPLOYEE"
        })
      });

      const authResult = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(authResult.error_description || "Unknown error");
      }

      console.log("PROD Auth Token:", authResult.access_token);
      return authResult.access_token;
    } catch (error) {
      alert("Failed to get PROD auth token: " + error.message);
      return null;
    }
  };
  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const result = await response.json();
      return result[0][0][0]; // Extract translated text
    } catch (error) {
      console.error("Translation failed:", error);
      return text; // If translation fails, use original text
    }
  };

  const handleSubmit = async (messages, locale) => {
    if (messages.length === 0) {
      alert(`No messages to submit for ${locale}`);
      return;
    }
    // validation added
    if (messages && messages.length > 0) {
      const allSameModule = messages.every(msg => msg.module === messages[0].module);
      const allSameLocale = messages.every(msg => msg.locale === messages[0].locale);
      if (!allSameLocale) {
        alert('All localization entries must have the same Locale before submission.');
        return false;
      }
      if (!allSameModule) {
        alert('All localization entries must belong to the same Module before submission.');
        return false;
      }
    } else {
      alert("Please add localization details before proceeding");
      return false;
    }
    const authToken = environment === 'UAT' ? await getAuthTokenUAT() : await getAuthTokenPROD();
    if(!authToken) {
      alert("Auth token has not been generated Properly")
    }

    const requestBody = {
      RequestInfo: {
        apiId: "emp",
        ver: "1.0",
        ts: "10-03-2017 00:00:00",
        action: "create",
        did: "1",
        key: "abcdkey",
        msgId: "20170310130900",
        requesterId: "rajesh",
        authToken: authToken,
        userInfo: { id: 128 },
      },
      tenantId: "od",
      messages: messages.map(msg => ({
        locale: msg.locale,
        code: msg.code,
        message: msg.message,
        module: msg.module,
      })),
    };

    const url = environment === "UAT" ? "https://sujog-dev.odisha.gov.in" : "https://sujog.odisha.gov.in";
    try {
      const response = await fetch(`${url}/localization/messages/v1/_upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      alert(result.message || `Localization added successfully for ${locale}`);
    } catch (error) {
      alert(`Error submitting localization data for ${locale}`);
    }
  };

  return (
    <div className="container">
      <h2>Localization Manager</h2>

      {/* Environment Selector */}
      <div className="env-selector">
        <label>Select Environment:</label>
        <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
          <option value="UAT">UAT</option>
          <option value="PROD">PROD</option>
        </select>
      </div>

      {/* Form Inputs */}
      <div className="form-group">
        <input type="text" placeholder="Code" value={newMessage.code} onChange={(e) => setNewMessage({ ...newMessage, code: e.target.value })} />
        <input type="text" placeholder="Message" value={newMessage.message} onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })} />

        <select value={newMessage.module} onChange={(e) => setNewMessage({ ...newMessage, module: e.target.value })}>
          <option value="">Select Module</option>
          {modules.map((mod) => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
      </div>

      <button onClick={handleAddMessage} className="add-button">Add Localization</button>

      {/* English Table */}
      {englishMessages.length > 0 && (
        <>
          <h3>English Localization (en_IN)</h3>
          <table>
            <thead>
              <tr>
                <th>Locale</th>
                <th>Code</th>
                <th>Message</th>
                <th>Module</th>
              </tr>
            </thead>
            <tbody>
              {englishMessages.map((msg, index) => (
                <tr key={index}>
                  <td>{msg.locale}</td>
                  <td>{msg.code}</td>
                  <td>{msg.message}</td>
                  <td>{msg.module}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => handleSubmit(englishMessages, "en_IN")} className="submit-button">Submit English</button>
        </>
      )}

      {/* Odia Table */}
      {odiaMessages.length > 0 && (
        <>
          <h3>Odia Localization (od_IN)</h3>
          <table>
            <thead>
              <tr>
                <th>Locale</th>
                <th>Code</th>
                <th>Message</th>
                <th>Module</th>
              </tr>
            </thead>
            <tbody>
              {odiaMessages.map((msg, index) => (
                <tr key={index}>
                  <td>{msg.locale}</td>
                  <td>{msg.code}</td>
                  <td>
                    <input
                      type="text"
                      value={msg.message}
                      onChange={(e) => {
                        const updatedMessages = [...odiaMessages];
                        updatedMessages[index].message = e.target.value;
                        setOdiaMessages(updatedMessages);
                      }}
                    />
                  </td>
                  <td>{msg.module}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => handleSubmit(odiaMessages, "od_IN")} className="submit-button">Submit Odia</button>
        </>
      )}
    </div>
  );
};

export default LocalizationManager;
