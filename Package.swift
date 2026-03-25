// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "PeptideGuideApp",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .executable(
            name: "PeptideGuideApp",
            targets: ["PeptideGuideApp"]
        ),
    ],
    targets: [
        .executableTarget(
            name: "PeptideGuideApp",
            resources: [
                .process("Resources"),
            ]
        ),
        .testTarget(
            name: "PeptideGuideAppTests",
            dependencies: ["PeptideGuideApp"]
        ),
    ]
)
