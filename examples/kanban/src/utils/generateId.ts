// https://stackoverflow.com/a/8084248/1980235
const generateId = () => (Math.random() + 1).toString(36).substring(7);

export default generateId;
