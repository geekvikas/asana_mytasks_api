const asana = require("asana");
const USER_ID = "me";
const INVALID_RESPONSE = "Invalid API Response";
const SERVER_ERROR = "Unexpected Server Error";

const DIRECT_LINK = "https://app.asana.com/0/0/{taskId}/f";

const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

let client = null;
let workspaceId = null;

async function UserTaskList() {
  return new Promise((resolve, reject) => {
    client.userTaskLists
      .getUserTaskListForUser(USER_ID, { workspace: workspaceId })
      .then((result) => {
        if (result && result.gid) {
          resolve(result.gid);
        } else {
          reject(INVALID_RESPONSE);
        }
      })
      .catch(() => {
        reject(SERVER_ERROR);
      });
  });
}

async function TasksInList(listId) {
  return new Promise((resolve, reject) => {
    client.tasks
      .getTasksForUserTaskList(listId, {
        completed_since: "now",
        opt_fields: "name,custom_fields",
      })
      .then((result) => {
        if (result && result.data) {
          result.data.map((x) => {
            const status = x.custom_fields.filter(
              (y) => y.name === "Status"
            )[0];
            if (
              status &&
              status.enabled &&
              status.enum_value &&
              status.enum_value.enabled
            )
              x.status = status.enum_value.name;
            else x.status = "";
            x.directLink = DIRECT_LINK.replace(/{taskId}/, x.gid);
            delete x.custom_fields;
          });
          resolve(groupBy(result.data, "status"));
        } else {
          reject(INVALID_RESPONSE);
        }
      })
      .catch(() => {
        reject(SERVER_ERROR);
      });
  });
}

exports.mytasks = (req, res) => {
  if (!req.token || !req.workspaceId) {
    res.status(400).send("Missing token or workspaceId");
    return;
  }

  client = asana.Client.create().useAccessToken(token);
  workspaceId = req.workspaceId;

  UserTaskList()
    .then((id) => {
      TasksInList(id)
        .then((data) => {
          res.json(data);
        })
        .catch((err) =>
          res.status(404).send(`Cannot get Tasks for '${id}', Reason: ${err}`)
        );
    })
    .catch((err) =>
      res
        .status(404)
        .send(`Cannot get User Task List for User '${USER_ID}', Reason: ${err}`)
    );
};
