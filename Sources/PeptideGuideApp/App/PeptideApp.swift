import SwiftUI

@main
struct PeptideGuideApp: App {
    @StateObject private var store = AppStore()

    var body: some Scene {
        WindowGroup("Peptide Guide") {
            AppShellView()
                .environmentObject(store)
                .frame(minWidth: 1200, minHeight: 800)
        }
        .defaultSize(width: 1440, height: 920)
        .windowStyle(.hiddenTitleBar)

        Settings {
            PreferencesView()
                .environmentObject(store)
                .frame(width: 480)
                .padding(24)
        }
    }
}
