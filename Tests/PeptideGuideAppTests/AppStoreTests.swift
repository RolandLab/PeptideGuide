import Testing
@testable import PeptideGuideApp

@MainActor
struct AppStoreTests {
    @Test
    func mockDataContainsAllLockedCompounds() {
        #expect(MockCompounds.all.count == 27)
        #expect(MockCompounds.all.contains(where: { $0.name == "Retatrutide" }))
        #expect(MockCompounds.all.contains(where: { $0.name == "SS-31" }))
    }

    @Test
    func compareSelectionPreventsDuplicatesAndCapsAtThree() {
        let store = AppStore(compounds: MockCompounds.all)
        let first = MockCompounds.all[0]
        let second = MockCompounds.all[1]
        let third = MockCompounds.all[2]
        let fourth = MockCompounds.all[3]

        #expect(store.addToCompare(first))
        #expect(store.addToCompare(second))
        #expect(store.addToCompare(third))
        #expect(store.addToCompare(first) == false)
        #expect(store.addToCompare(fourth) == false)
        #expect(store.compareCompounds.count == 3)
    }

    @Test
    func searchMatchesNameTagAndSummaryText() {
        let store = AppStore(compounds: MockCompounds.all)

        store.searchText = "mitochondria"
        let results = store.filteredCompounds()

        #expect(results.contains(where: { $0.name == "MOTS-c" }))
        #expect(results.contains(where: { $0.name == "SS-31" }))
    }

    @Test
    func selectingCompoundTracksRecentHistory() {
        let store = AppStore(compounds: MockCompounds.all)
        let compound = MockCompounds.all[5]

        store.selectCompound(compound)
        store.selectCompound(MockCompounds.all[2])
        store.selectCompound(compound)

        #expect(store.recentlyViewed.first == compound)
        #expect(store.recentlyViewed.count == 2)
    }

    @Test
    func savingCompareSetStoresCurrentSelection() {
        let store = AppStore(compounds: MockCompounds.all)

        _ = store.addToCompare(MockCompounds.all[0])
        _ = store.addToCompare(MockCompounds.all[1])
        store.saveCurrentCompareSet()

        #expect(store.savedCompareSets.count == 1)
        #expect(store.savedCompareSets[0].compoundIDs.count == 2)
    }
}
