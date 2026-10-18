import { generatePatternBuffer } from '../src/utils/patternGenerator';

describe('Pattern Generator', () => {
  describe('generatePatternBuffer', () => {
    test('should generate a buffer of correct size', () => {
      const buffer = generatePatternBuffer({ width: 100, height: 100, seed: 'test-seed' });

      // RGB buffer: width * height * 3 channels
      expect(buffer.length).toBe(100 * 100 * 3);
    });

    test('should generate deterministic output for same seed', () => {
      const buffer1 = generatePatternBuffer({ width: 50, height: 50, seed: 'deterministic-test' });
      const buffer2 = generatePatternBuffer({ width: 50, height: 50, seed: 'deterministic-test' });

      expect(buffer1.equals(buffer2)).toBe(true);
    });

    test('should generate different output for different seeds', () => {
      const buffer1 = generatePatternBuffer({ width: 50, height: 50, seed: 'seed-one' });
      const buffer2 = generatePatternBuffer({ width: 50, height: 50, seed: 'seed-two' });

      expect(buffer1.equals(buffer2)).toBe(false);
    });

    test('should generate valid RGB values (0-255)', () => {
      const buffer = generatePatternBuffer({ width: 100, height: 100, seed: 'rgb-test' });

      for (let i = 0; i < buffer.length; i++) {
        expect(buffer[i]).toBeGreaterThanOrEqual(0);
        expect(buffer[i]).toBeLessThanOrEqual(255);
      }
    });

    test('should maintain pattern consistency across different dimensions', () => {
      // Generate patterns at different sizes
      const small = generatePatternBuffer({ width: 100, height: 100, seed: 'consistency-test' });
      const large = generatePatternBuffer({ width: 200, height: 200, seed: 'consistency-test' });

      // Sample center pixel from both (should be same pattern, just different resolution)
      // Center of 100x100 is (50,50), center of 200x200 is (100,100)
      const smallCenterIdx = (50 * 100 + 50) * 3;
      const largeCenterIdx = (100 * 200 + 100) * 3;

      // Colors at center should be identical (same normalized coordinate)
      expect(small[smallCenterIdx]).toBe(large[largeCenterIdx]);
      expect(small[smallCenterIdx + 1]).toBe(large[largeCenterIdx + 1]);
      expect(small[smallCenterIdx + 2]).toBe(large[largeCenterIdx + 2]);
    });

    test('should handle non-square dimensions with center crop', () => {
      // Wide image (400x200)
      const wide = generatePatternBuffer({ width: 400, height: 200, seed: 'aspect-test' });
      expect(wide.length).toBe(400 * 200 * 3);

      // Tall image (200x400)
      const tall = generatePatternBuffer({ width: 200, height: 400, seed: 'aspect-test' });
      expect(tall.length).toBe(200 * 400 * 3);

      // Square reference (400x400)
      const square = generatePatternBuffer({ width: 400, height: 400, seed: 'aspect-test' });

      // Center pixels of wide and tall should match center of square
      // Wide (400x200): center is (200, 100), which maps to square (200, 200)
      // Tall (200x400): center is (100, 200), which maps to square (200, 200)
      const wideCenterIdx = (100 * 400 + 200) * 3;
      const tallCenterIdx = (200 * 200 + 100) * 3;
      const squareCenterIdx = (200 * 400 + 200) * 3;

      expect(wide[wideCenterIdx]).toBe(square[squareCenterIdx]);
      expect(tall[tallCenterIdx]).toBe(square[squareCenterIdx]);
    });

    test('should handle minimum dimensions', () => {
      const buffer = generatePatternBuffer({ width: 10, height: 10, seed: 'min-test' });
      expect(buffer.length).toBe(10 * 10 * 3);
    });

    test('should handle large dimensions', () => {
      const buffer = generatePatternBuffer({ width: 1000, height: 1000, seed: 'large-test' });
      expect(buffer.length).toBe(1000 * 1000 * 3);
    });

    test('should generate different patterns for varied seeds', () => {
      const seeds = ['game-1', 'game-2', 'publisher-abc', 'genre-action', 'user-123'];
      const buffers = seeds.map(seed =>
        generatePatternBuffer({ width: 50, height: 50, seed })
      );

      // Each buffer should be unique
      for (let i = 0; i < buffers.length; i++) {
        for (let j = i + 1; j < buffers.length; j++) {
          expect(buffers[i].equals(buffers[j])).toBe(false);
        }
      }
    });

    test('should produce consistent patterns for game-like seeds', () => {
      // Simulate seeds that might be used for game cover images
      const gameSeed = 'The Legend of Zelda: Breath of the Wild';
      const buffer1 = generatePatternBuffer({ width: 300, height: 400, seed: gameSeed });
      const buffer2 = generatePatternBuffer({ width: 300, height: 400, seed: gameSeed });

      expect(buffer1.equals(buffer2)).toBe(true);
    });
  });
});
