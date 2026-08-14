import { Donor, BloodGroup, UrgencyLevel } from '../types';
import { calculateDistanceKm } from './distanceCalculator';

// Compatible blood donors map (Recipient -> Compatible Donor Blood Groups)
const BLOOD_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'Bombay Phenotype (O-h)': ['Bombay Phenotype (O-h)']
};

/**
 * Checks medical & time-interval eligibility for a donor.
 */
export function checkDonorEligibility(donor: Donor): { isEligible: boolean; reason: string; nextEligibleDate?: string } {
  if (donor.eligibilityStatus === 'PERMANENTLY_INELIGIBLE') {
    return { isEligible: false, reason: 'Permanently ineligible due to medical record.' };
  }

  if (donor.eligibilityStatus === 'TEMPORARILY_INELIGIBLE') {
    return {
      isEligible: false,
      reason: donor.eligibilityReason || 'Temporarily ineligible for donation.',
      nextEligibleDate: donor.nextEligibleDate
    };
  }

  if (donor.availabilityStatus === 'NOT AVAILABLE' || donor.isAvailable === false) {
    return { isEligible: false, reason: 'Donor marked as unavailable.' };
  }

  if (donor.emergencyAlertsEnabled === false) {
    return { isEligible: false, reason: 'Donor opted out of emergency alerts.' };
  }

  if (donor.lastDonationDate) {
    const lastDate = new Date(donor.lastDonationDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    const REQUIRED_DAYS = 90; // Standard 3-month wait interval

    if (diffDays < REQUIRED_DAYS) {
      const remainingDays = REQUIRED_DAYS - diffDays;
      const nextDate = new Date(today.getTime() + remainingDays * 24 * 3600 * 1000).toISOString().split('T')[0];
      return {
        isEligible: false,
        reason: `Donated ${diffDays} days ago. Must wait ${remainingDays} more days.`,
        nextEligibleDate: nextDate
      };
    }
  }

  return { isEligible: true, reason: 'Eligible for donation' };
}

export interface MatchedDonorResult {
  donor: Donor;
  matchScore: number; // 0-100%
  distanceKm: number;
  isExactGroupMatch: boolean;
  compatibilityReason: string;
}

/**
 * Smart matching algorithm calculating match score for eligible donors.
 */
export function calculateSmartDonorMatches(
  donors: Donor[],
  targetBloodGroup: BloodGroup,
  requesterLat: number,
  requesterLng: number,
  maxRadiusKm: number = 50,
  urgency: UrgencyLevel = 'CRITICAL'
): MatchedDonorResult[] {
  const compatibleGroups = BLOOD_COMPATIBILITY_MAP[targetBloodGroup] || [targetBloodGroup];

  const results: MatchedDonorResult[] = [];

  for (const donor of donors) {
    // 1. Eligibility Check — Exclude completely ineligible donors
    const eligibility = checkDonorEligibility(donor);
    if (!eligibility.isEligible) {
      continue;
    }

    // 2. Compatibility Check
    if (!compatibleGroups.includes(donor.bloodGroup)) {
      continue;
    }

    // 3. Distance Calculation
    const distanceKm = calculateDistanceKm(requesterLat, requesterLng, donor.lat, donor.lng);
    if (distanceKm > maxRadiusKm) {
      continue;
    }

    // 4. Calculate Score Components
    let score = 0;

    // Blood compatibility (40 pts max)
    const isExactGroupMatch = donor.bloodGroup === targetBloodGroup;
    score += isExactGroupMatch ? 40 : 28;

    // Distance Score (30 pts max)
    if (distanceKm <= 3) {
      score += 30;
    } else if (distanceKm <= 7) {
      score += 24;
    } else if (distanceKm <= 15) {
      score += 18;
    } else if (distanceKm <= 30) {
      score += 12;
    } else {
      score += 6;
    }

    // Reliability & Past Response Score (20 pts max)
    const reliability = donor.reliabilityScore || donor.responseLikelihoodScore || 90;
    score += Math.round((reliability / 100) * 20);

    // Urgency & Availability Bonus (10 pts max)
    if (donor.availabilityStatus === 'AVAILABLE' || donor.isAvailable) {
      score += 10;
    }

    const finalScore = Math.min(99, Math.max(50, score));

    results.push({
      donor,
      matchScore: finalScore,
      distanceKm: parseFloat(distanceKm.toFixed(1)),
      isExactGroupMatch,
      compatibilityReason: isExactGroupMatch
        ? `Exact ${donor.bloodGroup} match (${finalScore}% compatibility score)`
        : `Compatible ${donor.bloodGroup} universal donor (${finalScore}% score)`
    });
  }

  // Sort by highest match score first, then closest distance
  return results.sort((a, b) => b.matchScore - a.matchScore || a.distanceKm - b.distanceKm);
}
