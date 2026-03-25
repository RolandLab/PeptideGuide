import Foundation

struct Compound: Identifiable, Hashable {
    let id: UUID
    let name: String
    let categories: [CompoundCategory]
    let tags: [String]
    let summary: String
    let mechanism: String
    let benefits: String
    let research: String
    let primarySystems: String
    let appetiteEffect: String
    let recoveryRelevance: String
    let cognitiveRelevance: String
    let energyRelevance: String
    let researchMaturity: String
    let differentiators: String
    let resources: [ResourceLink]
}
