const renderJson = payload => {
  console.log(JSON.stringify(payload, 0, 4));
  return payload;
};

module.exports = { renderJson };
