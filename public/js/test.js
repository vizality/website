(function () {
  $vz.actions.registerAction('bobbo', async () => {
    console.log('we are testing');
    throw new Error('now we are erroring');
  });
})();