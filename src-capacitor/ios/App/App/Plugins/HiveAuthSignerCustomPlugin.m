//
//  HASCustomPlugin.m
//  App
//
//  Created by Sagar on 20/11/23.
//

#import <Foundation/Foundation.h>

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(
           HiveAuthSignerCustomPlugin,
           "HiveAuthSignerCustomPlugin",
           CAP_PLUGIN_METHOD(callPlugin, CAPPluginReturnPromise);
           )
