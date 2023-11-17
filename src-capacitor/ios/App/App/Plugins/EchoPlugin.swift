//
//  EchoPlugin.swift
//  App
//
//  Created by Sagar on 16/11/23.
//

import Foundation

import Capacitor

@objc(HiveAuthPlugin)
public class HiveAuthPlugin: CAPPlugin {

    public override func load() {
        debugPrint("Plugin is loaded")
    }

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": value
        ])
    }
}
