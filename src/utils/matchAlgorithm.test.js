import { describe, it, expect } from 'vitest';

// Mock function for logic we haven't implemented yet, but to structure the test
const calculateMatchScore = (userInterests, candidateInterests) => {
    if (!userInterests || !candidateInterests) return 0;
    const shared = userInterests.filter(i => candidateInterests.includes(i));
    return (shared.length / Math.max(userInterests.length, candidateInterests.length)) * 100;
};

describe('Matching Algorithm', () => {
    it('calculates 100% match for identical interests', () => {
        const user = ['music', 'travel'];
        const candidate = ['music', 'travel'];
        expect(calculateMatchScore(user, candidate)).toBe(100);
    });

    it('calculates 0% match for no shared interests', () => {
        const user = ['music'];
        const candidate = ['coding'];
        expect(calculateMatchScore(user, candidate)).toBe(0);
    });

    it('calculates partial match correctly', () => {
        const user = ['music', 'travel', 'coding'];
        const candidate = ['music', 'painting', 'reading'];
        // Shared: 1 (music). Max length: 3. Score: 1/3 * 100 = 33.33
        expect(calculateMatchScore(user, candidate)).toBeCloseTo(33.33, 1);
    });

    it('handles empty interest lists gracefully', () => {
        expect(calculateMatchScore([], ['music'])).toBe(0);
        expect(calculateMatchScore(null, ['music'])).toBe(0);
    });
});
