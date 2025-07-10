import apk from '.';

describe('modules/versioning/apk/index', () => {
  describe('isValid', () => {
    it.each`
      version               | expected
      ${'2.39.0-r0'}        | ${true}
      ${'2.39.0'}           | ${true}
      ${'2.39.0-rc1'}       | ${true}
      ${'foo'}              | ${false}
      ${'a.39.0-'}          | ${false}
      ${'6.5_p20250503-r0'} | ${true}
    `('isValid($version) === $expected', ({ version, expected }) => {
      expect(apk.isValid(version)).toBe(expected);
    });
  });

  describe('isStable', () => {
    it.each`
      version             | expected
      ${'2.39.0-r0'}      | ${true}
      ${'2.39.0_rc1-r0'}  | ${false}
      ${'2.39.0'}         | ${true}
      ${'2.39.0-r0'}      | ${true}
      ${'2.39.0_rc2'}     | ${false}
      ${'2.39.0_rc10-r0'} | ${false}
      ${'2.39.0_rc1'}     | ${false}
      ${'2.39.0_rc0'}     | ${false}
    `('isStable($version) === $expected', ({ version, expected }) => {
      expect(apk.isStable(version)).toBe(expected);
    });
  });

  describe('getMajor', () => {
    it.each`
      version            | expected
      ${'2.39.0-r0'}     | ${2}
      ${'2.39.0_rc1-r0'} | ${2}
    `('getMajor($version) === $expected', ({ version, expected }) => {
      expect(apk.getMajor(version)).toBe(expected);
    });
  });

  describe('getMinor', () => {
    it.each`
      version            | expected
      ${'2.39.0-r0'}     | ${39}
      ${'2.39.0_rc1-r0'} | ${39}
    `('getMinor($version) === $expected', ({ version, expected }) => {
      expect(apk.getMinor(version)).toBe(expected);
    });
  });

  describe('getPatch', () => {
    it.each`
      version               | expected
      ${'2.39.0-r0'}        | ${0}
      ${'2.39.0_rc1-r0'}    | ${0}
      ${'6.5_p20250503-r0'} | ${20250503}
    `('getPatch($version) === $expected', ({ version, expected }) => {
      expect(apk.getPatch(version)).toBe(expected);
    });
  });

  describe('compare', () => {
    it.each`
      a                | b                | expected
      ${'2.39.0-r1'}   | ${'2.39.0-r0'}   | ${1}
      ${'2.39.1-r0'}   | ${'2.39.0-r0'}   | ${1}
      ${'2.39.0-r0'}   | ${'2.39.1-r0'}   | ${-1}
      ${'2.39.0-r0'}   | ${'2.39.0-r1'}   | ${-1}
      ${'2.39.0'}      | ${'2.39.0'}      | ${0}
      ${'2.39.0'}      | ${'2.39.1'}      | ${-1}
      ${'2.39.1'}      | ${'2.39.0'}      | ${1}
      ${'2.39.0-r0'}   | ${'2.39.0'}      | ${1}
      ${'2.39.0'}      | ${'2.39.0-r0'}   | ${-1}
      ${'2.39.0~beta'} | ${'2.39.0'}      | ${-1}
      ${'2.39.0'}      | ${'2.39.0~beta'} | ${1}
    `('compare($a, $b) === $expected', ({ a, b, expected }) => {
      expect(Math.sign(apk.sortVersions(a, b))).toBe(Math.sign(expected));
    });
  });

  describe('isGreaterThan', () => {
    it.each`
      a              | b              | expected
      ${'2.39.1-r0'} | ${'2.39.0-r0'} | ${true}
      ${'2.39.0-r1'} | ${'2.39.0-r0'} | ${true}
      ${'2.39.0-r0'} | ${'2.39.1-r0'} | ${false}
      ${'2.39.0-r0'} | ${'2.39.0-r1'} | ${false}
    `('isGreaterThan($a, $b) === $expected', ({ a, b, expected }) => {
      expect(apk.isGreaterThan(a, b)).toBe(expected);
    });
  });

  describe('equals', () => {
    it.each`
      a              | b              | expected
      ${'2.39.0-r0'} | ${'2.39.0-r0'} | ${true}
      ${'2.39.0'}    | ${'2.39.0'}    | ${true}
      ${'2.39.0-r0'} | ${'2.39.0-r1'} | ${false}
      ${'2.39.0'}    | ${'2.39.1'}    | ${false}
    `('equals($a, $b) === $expected', ({ a, b, expected }) => {
      expect(apk.equals(a, b)).toBe(expected);
    });
  });
});
