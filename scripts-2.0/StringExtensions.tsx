// eslint-disable-next-line
declare interface String {
  normalizeForSearch() : string;
}

String.prototype.normalizeForSearch = function () {
  return this.toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll('ł', 'l')
    ;
};
