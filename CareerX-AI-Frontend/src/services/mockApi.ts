import { careers, roadmap, skills } from '../data/mockData'

export async function getMockProfile() { return Promise.resolve({ name: 'Jayaseelan G', targetRole: 'AI / ML Engineer', trust: 91, readiness: 78, skills }) }
export async function getMockCareers() { return Promise.resolve(careers) }
export async function getMockRoadmap() { return Promise.resolve(roadmap) }
export async function simulateMock(addSkills: string[]) {
  return Promise.resolve(careers.map(c => ({ ...c, simulatedMatch: Math.min(99, c.match + (addSkills.length * (c.name.includes('ML') ? 2 : 1))) })))
}
