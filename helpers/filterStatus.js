module.exports = (query) => {
  let filterStatus = [
    {
      name: "Tất cả",
      status: "",
      class: "",
    },
    {
      name: "Hoạt động",
      status: "active",
      class: "",
    },
    {
      name: "Dừng Hoạt động",
      status: "inactive",
      class: "",
    },
  ];
  if (query.status) {
    const index = filterStatus.findIndex((element) => element.status == query.status);
    filterStatus[index].class = "active";
  } else {
    const index = filterStatus.findIndex((element) => element.status == "");
    filterStatus[index].class = "active";
  }

  return filterStatus;
};
