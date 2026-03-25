import SwiftUI

struct AppShellView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        ZStack(alignment: .top) {
            AppColors.background.ignoresSafeArea()

            Rectangle()
                .fill(AppColors.windowChrome)
                .frame(height: 42)
                .ignoresSafeArea(edges: .top)

            NavigationSplitView {
                SidebarView()
                    .navigationSplitViewColumnWidth(min: 230, ideal: 250, max: 280)
            } content: {
                ContentRouterView()
                    .navigationSplitViewColumnWidth(min: 440, ideal: 520, max: 620)
            } detail: {
                Group {
                    if let compound = store.detailCompound {
                        CompoundDetailView(compound: compound)
                    } else {
                        EmptyStateView(
                            title: store.selectedSidebarItem == .preferences ? "Preferences" : "Select a Compound",
                            systemImage: store.selectedSidebarItem == .preferences ? "gearshape" : "capsule.portrait",
                            message: store.selectedSidebarItem == .preferences
                                ? "App-level settings are shown in the center pane. Return to the library to continue exploring compounds."
                                : "Choose a lane or search the library to begin exploring mechanisms, research, and potential benefits."
                        )
                        .padding(32)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(AppColors.background.ignoresSafeArea())
            }
            .navigationSplitViewColumnWidth(min: 620, ideal: 760)
            .navigationSplitViewStyle(.balanced)
            .tint(AppColors.accent)
            .background(AppColors.background.ignoresSafeArea())
            .padding(.top, 2)
        }
        .onAppear {
            store.applyLaunchPreference()
        }
    }
}
