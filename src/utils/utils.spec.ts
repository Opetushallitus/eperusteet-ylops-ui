import { findIndexWithTagsIncluded } from './utils';

describe('Utils', () => {
  test('findIndexWithTagsIncluded', () => {
    expect(findIndexWithTagsIncluded('', 0)).toEqual(-1);
    expect(findIndexWithTagsIncluded('123', 2)).toEqual(2);
    expect(findIndexWithTagsIncluded('123', 3)).toEqual(-1);
    expect(findIndexWithTagsIncluded('<p>123</p>', 0)).toEqual(3);
    expect(findIndexWithTagsIncluded('<p>123</p>', 2)).toEqual(5);
    expect(findIndexWithTagsIncluded('<p>123</p>', 3)).toEqual(6);
    expect(findIndexWithTagsIncluded('<p></p>', 0)).toEqual(3);
    expect(findIndexWithTagsIncluded('<p></p>', 1)).toEqual(3);
    expect(findIndexWithTagsIncluded('<p></p>', -1)).toEqual(-1);
    expect(findIndexWithTagsIncluded('<p><em>123<i>456</i><em></p>', 3)).toEqual(13);
    expect(findIndexWithTagsIncluded('<p>hello &abcd; world</p>', 15)).toEqual(23);
    expect(findIndexWithTagsIncluded('<p>hello &AbCd; world</p>', 15)).toEqual(23);
    expect(findIndexWithTagsIncluded('<p>hello &#123; world</p>', 15)).toEqual(23);
  });
});
