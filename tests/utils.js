const defaultKeys = ['log', 'warn', 'error'];

export const mockConsole = (methodsToMock = defaultKeys) => {
  const originalConsole = { ...console };
  methodsToMock.forEach((key) => {
    global.console[key] = jest.fn();
  });
  // Return function to restore console
  const restore = () => {
    global.console = originalConsole;
  };
  return restore;
};
