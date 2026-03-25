import SwiftUI

struct ContentRouterView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        Group {
            switch store.selectedSidebarItem {
            case .home:
                HomeView()
            case .explore:
                ExploreView()
            case .compare:
                CompareView()
            case .saved:
                SavedView()
            case .preferences:
                PreferencesView()
            case .lane(let category):
                LaneView(category: category)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(AppColors.background.ignoresSafeArea())
    }
}
