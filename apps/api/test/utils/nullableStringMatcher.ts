export const nullableString = {
  asymmetricMatch: (actual: any) =>
    actual === null || typeof actual === 'string',
};
