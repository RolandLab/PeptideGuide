import Foundation

struct CompareSet: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let compoundIDs: [UUID]
    let createdAt: Date
}
