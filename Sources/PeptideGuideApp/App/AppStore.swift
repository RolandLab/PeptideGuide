import SwiftUI

@MainActor
final class AppStore: ObservableObject {
    @Published var allCompounds: [Compound]
    @Published var selectedSidebarItem: SidebarItem
    @Published var selectedCategory: CompoundCategory?
    @Published var selectedCompound: Compound?
    @Published var compareCompounds: [Compound] = []
    @Published var savedCompounds: Set<UUID> = []
    @Published var savedCompareSets: [CompareSet] = []
    @Published var searchText: String = ""
    @Published var selectedTags: Set<String> = []
    @Published var recentlyViewed: [Compound] = []
    @Published var preferredLaunchScreen: LaunchScreenOption = .home
    @Published var showSuggestedSection = true
    @Published var readingDensity: ReadingDensity = .comfortable
    @Published var sortOption: CompoundSortOption = .alphabetical

    init(compounds: [Compound] = MockCompounds.all) {
        self.allCompounds = compounds
        self.selectedSidebarItem = .home
        self.selectedCategory = nil
        self.selectedCompound = compounds.first
    }

    var allTags: [String] {
        Array(Set(allCompounds.flatMap(\.tags))).sorted()
    }

    var suggestedCompounds: [Compound] {
        namedCompounds(MockCompounds.suggestedNames)
    }

    var trendingCompounds: [Compound] {
        namedCompounds(MockCompounds.trendingNames)
    }

    var savedCompoundItems: [Compound] {
        allCompounds
            .filter { savedCompounds.contains($0.id) }
            .sorted { $0.name < $1.name }
    }

    var detailCompound: Compound? {
        switch selectedSidebarItem {
        case .preferences:
            return nil
        default:
            return selectedCompound
        }
    }

    func applyLaunchPreference() {
        if selectedSidebarItem == .home, preferredLaunchScreen != .home {
            selectSidebarItem(preferredLaunchScreen.sidebarItem)
        }
    }

    func selectSidebarItem(_ item: SidebarItem) {
        selectedSidebarItem = item
        switch item {
        case .lane(let category):
            selectedCategory = category
        default:
            selectedCategory = nil
        }
    }

    func selectCompound(_ compound: Compound) {
        selectedCompound = compound
        trackRecentlyViewed(compound)
    }

    func toggleSaved(compound: Compound) {
        if savedCompounds.contains(compound.id) {
            savedCompounds.remove(compound.id)
        } else {
            savedCompounds.insert(compound.id)
        }
    }

    func isSaved(_ compound: Compound) -> Bool {
        savedCompounds.contains(compound.id)
    }

    @discardableResult
    func addToCompare(_ compound: Compound) -> Bool {
        guard compareCompounds.contains(compound) == false else { return false }
        guard compareCompounds.count < 3 else { return false }
        compareCompounds.append(compound)
        return true
    }

    func removeFromCompare(_ compound: Compound) {
        compareCompounds.removeAll { $0.id == compound.id }
    }

    func saveCurrentCompareSet() {
        guard compareCompounds.count >= 2 else { return }
        let ids = compareCompounds.map(\.id)
        guard savedCompareSets.contains(where: { $0.compoundIDs == ids }) == false else { return }

        let title = compareCompounds.map(\.name).joined(separator: " vs ")
        savedCompareSets.insert(
            CompareSet(
                title: title,
                compoundIDs: ids,
                createdAt: .now
            ),
            at: 0
        )
    }

    func openCompareSet(_ compareSet: CompareSet) {
        compareCompounds = allCompounds.filter { compareSet.compoundIDs.contains($0.id) }
        selectedSidebarItem = .compare
        selectedCompound = compareCompounds.first
    }

    func availableTags(for category: CompoundCategory? = nil) -> [String] {
        let compounds = filteredCompounds(category: category, includeTagFiltering: false, searchQuery: "")
        return Array(Set(compounds.flatMap(\.tags))).sorted()
    }

    func filteredCompounds(
        category: CompoundCategory? = nil,
        includeTagFiltering: Bool = true,
        searchQuery: String? = nil
    ) -> [Compound] {
        let query = (searchQuery ?? searchText).trimmingCharacters(in: .whitespacesAndNewlines)

        return allCompounds.filter { compound in
            let matchesCategory = category == nil || compound.categories.contains(category!)
            let matchesTags = includeTagFiltering == false || selectedTags.isEmpty || selectedTags.allSatisfy(compound.tags.contains)
            let matchesSearch = query.isEmpty || searchableText(for: compound).localizedCaseInsensitiveContains(query)
            return matchesCategory && matchesTags && matchesSearch
        }
    }

    func sorted(_ compounds: [Compound]) -> [Compound] {
        switch sortOption {
        case .alphabetical:
            return compounds.sorted { $0.name < $1.name }
        case .recentlyViewed:
            let order = Dictionary(uniqueKeysWithValues: recentlyViewed.enumerated().map { ($1.id, $0) })
            return compounds.sorted {
                let left = order[$0.id] ?? Int.max
                let right = order[$1.id] ?? Int.max
                if left == right {
                    return $0.name < $1.name
                }
                return left < right
            }
        case .savedFirst:
            return compounds.sorted {
                let leftSaved = savedCompounds.contains($0.id)
                let rightSaved = savedCompounds.contains($1.id)
                if leftSaved == rightSaved {
                    return $0.name < $1.name
                }
                return leftSaved && rightSaved == false
            }
        }
    }

    func toggleTag(_ tag: String) {
        if selectedTags.contains(tag) {
            selectedTags.remove(tag)
        } else {
            selectedTags.insert(tag)
        }
    }

    func clearTagFilters() {
        selectedTags.removeAll()
    }

    func resetPreferences() {
        preferredLaunchScreen = .home
        showSuggestedSection = true
        readingDensity = .comfortable
    }

    private func namedCompounds(_ names: [String]) -> [Compound] {
        names.compactMap { name in
            allCompounds.first(where: { $0.name == name })
        }
    }

    private func searchableText(for compound: Compound) -> String {
        [
            compound.name,
            compound.categories.map(\.title).joined(separator: " "),
            compound.tags.joined(separator: " "),
            compound.summary,
            compound.mechanism,
            compound.benefits,
            compound.research,
            compound.primarySystems,
            compound.differentiators,
        ].joined(separator: " ")
    }

    private func trackRecentlyViewed(_ compound: Compound) {
        recentlyViewed.removeAll { $0.id == compound.id }
        recentlyViewed.insert(compound, at: 0)
        if recentlyViewed.count > 8 {
            recentlyViewed = Array(recentlyViewed.prefix(8))
        }
    }
}
