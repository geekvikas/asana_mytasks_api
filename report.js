const fetch = require("node-fetch");

const STYLE = "<style>html,body{font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-size: 13px;line-height: normal}.MyItemRow-left{align-items: center;display: flex;flex: 1 1000 auto;height: 100%;justify-content: flex-start;min-width: 1px;overflow: hidden;position: relative}.MyTaskRow-taskName:hover{background-color: #19db7e}.MyTaskRow-taskName{cursor:hand;flex: 0 1 auto;min-width: 1px;overflow: hidden;flex-grow: 1}.MyPill{cursor:hand;border-radius: 10px;font-size: 12px;height: 20px;line-height: 20px;padding: 0 8px;text-overflow: ellipsis}.In-Progress{background-color: #48dafd;color: #02485a}.In-Review{background-color: #37a862;color: #00423f}.Ready-To-Merge{background-color: #19db7e;color: #084426}.On-Hold{background-color: #fb5779;color: #ffffff}.Missing{background-color: gray;color: white}.MyItemRow{border-bottom: 1px solid transparent;border-top: 1px solid transparent;height: 34px;align-items: center;display: flex;justify-content: space-between;overflow: visible;padding: 0 32px;position: relative;transition: box-shadow 0s ease-in;white-space: nowrap}</style>";

const BASE_URL =
  "https://us-central1-asana-api-295508.cloudfunctions.net/mytasks?token={token}&workspaceId={workspaceId}&userId={userId}";

exports.report = (req, res) => {
  const url = BASE_URL.replace(/{token}/g, req.query.token || "")
    .replace(/{workspaceId}/g, req.query.workspaceId || "")
    .replace(/{userId}/g, req.query.userId || "");

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      let report = `<html><head>${STYLE}</head><body><div>`;
      Object.keys(data).map(status => {
        data[status].map(item=>{
          report+= `<div class="MyItemRow"><div class="MyItemRow-left"><div class="MyTaskRow-taskName" onclick="window.open('${item.directLink}')">${item.name}</div><div><div class="MyPill ${item.status.replace(/ /g,'-')}" onclick="window.open('${item.directLink}')">${item.status}</div></div></div></div>`;
        })
      });
      report+= "</div></body></html>";
      console.log(report)
    })
    .catch((err) => console.log(err.message));
};

const req = {
  query: {
    token: "1%2F1196431973750986%3A76825e8f99b801621ba74c094b8b1f4b",
  },
};


this.report(req);