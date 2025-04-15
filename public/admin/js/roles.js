// Permissons
const tablePermission = document.querySelector("[table-permissions]");
if (tablePermission) {
  console.log(tablePermission);
  const buttonSubmit = document.querySelector("[button-submit]");

  buttonSubmit.addEventListener("click", () => {
    let permissions = [];
    const rows = tablePermission.querySelectorAll("[data-name]");

    rows.forEach((row) => {
      const name = row.getAttribute("data-name");
      const inputs = row.querySelectorAll("input");
      if (name == "id") {
        inputs.forEach((input) => {
          const id = input.value;
          permissions.push({
            id: id,
            permissions: [],
          });
        });
      } else {
        inputs.forEach((input, index) => {
          const checked = input.checked;
          if (checked) {
            permissions[index].permissions.push(name);
          }
        });
      }
    });
    if (permissions.length > 0) {
      const formChangePermissions = document.querySelector("#form-change-permissions");
      const inputPermissions = formChangePermissions.querySelector("input[name='permissions']");
      inputPermissions.value = JSON.stringify(permissions);
      formChangePermissions.submit();
    }
  });
}
// End Permissons

// Permissions Data Default
const dataRecords = document.querySelector("[data-records]");
if (dataRecords) {
  const records = JSON.parse(dataRecords.getAttribute("data-records"));
  const tablePermission = document.querySelector("[table-permissions]");
   console.log(records);
  records.forEach((record, index) => {
    const permissions = record.permission;
   
    permissions.forEach((permission) => {
      const row = tablePermission.querySelector(`[data-name="${permission}"]`);
      console.log("g",tablePermission)
      const input = row.querySelectorAll("input")[index];
      console.log("hiện", index, row.querySelectorAll("input"));
      console.log("h",input)
      input.checked = true;
    });
  });
}
// End Permission Data Default
