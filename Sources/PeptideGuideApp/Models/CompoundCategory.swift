import Foundation

enum CompoundCategory: String, CaseIterable, Codable, Hashable, Identifiable {
    case metabolism
    case recovery
    case cognitive
    case performance
    case immune
    case appearance
    case energy

    var id: String { rawValue }

    var title: String {
        switch self {
        case .metabolism: "Metabolism / Fat Loss"
        case .recovery: "Recovery / Healing"
        case .cognitive: "Cognitive / Mood"
        case .performance: "Performance / Growth"
        case .immune: "Immune / Systemic"
        case .appearance: "Appearance"
        case .energy: "Cellular Energy"
        }
    }

    var subtitle: String {
        switch self {
        case .metabolism: "Appetite, glucose handling, body composition, and metabolic signaling."
        case .recovery: "Repair-oriented compounds focused on tissue recovery and inflammatory tone."
        case .cognitive: "Focus, stress resilience, mood, and neuro-supportive pathways."
        case .performance: "Growth hormone secretagogues, performance signaling, and physique support."
        case .immune: "Immune communication, mucosal health, and systemic regulation."
        case .appearance: "Skin, hair, pigmentation, and visible quality-of-life oriented compounds."
        case .energy: "Mitochondrial efficiency, endurance, and cellular energy maintenance."
        }
    }

    var icon: String {
        switch self {
        case .metabolism: "scalemass"
        case .recovery: "cross.case"
        case .cognitive: "brain.head.profile"
        case .performance: "figure.strengthtraining.traditional"
        case .immune: "allergens"
        case .appearance: "sparkles"
        case .energy: "bolt.heart"
        }
    }
}
