/**
* @name SkyPlugBD
* @author Skycreat
* @authorId 363751274656563212
* @version 0.0.1
* @description Skycreat's Smart BD Plugin
* @source https://github.com/Skycreat7/BD_Plugin/blob/main/plugin
* @updateUrl https://github.com/Skycreat7/BD_Plugin/blob/main/SkyPlugBD.plugin.js
*/
module.exports = (_ => {
	const config = {
		"info": {
			"name": "SkyPlugBD",
			"author": "Skycreat",
			"version": "0.0.1",
			"description": "Skycreat's Smart BD Plugin"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const maxLengths = {
			nick: 32,
			customstatus: 128,
			popoutnote: 256,
			profilenote: 256
		};
		const typeMap = {
			normal: "chat",
			sidebar: "chat",
			thread_creation: "threadcreation",
			form: "upload"
		};
		const nativeCounters = ["profile_bio_input"];
	
		return class CharCounter extends Plugin {
			onLoad () {
				this.patchedModules = {
					after: {
						ChannelTextAreaContainer: "render",
						Note: "render",
						NicknameSection: "default",
						CustomStatusModal: "render"
					}
				};
				
				this.defaults = {
					sliders: {
						showPercentage:			{value: 0,				description: "Only shows Counter after certain % of Max Length is reached"}
					}
				};
				
				this.css = `
					${BDFDB.dotCN._charcountercounteradded} {
						position: relative !important;
					}
					${BDFDB.dotCN._charcountercounter} {
						display: block;
						position: absolute;
						font-size: 15px;
						z-index: 10;
						pointer-events: none;
					}
					${BDFDB.dotCN._charcounterchatcounter} {
						right: 0;
						bottom: -1.3em;
					}
					${BDFDB.dotCN._charcountereditcounter} {
						right: 0;
						bottom: -1.3em;
					}
					${BDFDB.dotCN._charcounterthreadcreationcounter} {
						right: 0;
						bottom: -1.1em;
					}
					${BDFDB.dotCN._charcounteruploadcounter} {
						right: 0;
						bottom: -1.0em;
					}
					${BDFDB.dotCN._charcounternickcounter} {
						right: 0 !important;
						top: -1.5em;
					}
					${BDFDB.dotCN._charcountercustomstatuscounter} {
						right: 0 !important;
						top: -1.5em;
					}
					${BDFDB.dotCN._charcounterpopoutnotecounter} {
						right: 3px !important;
						bottom: -8px !important;
						font-size: 10px !important;
					}
					${BDFDB.dotCN._charcounterprofilenotecounter} {
						right: 0 !important;
						bottom: -10px !important;
						font-size: 12px !important;
					}
					${BDFDB.dotCN.usernotetextarea}:not(:focus) ~ ${BDFDB.dotCN._charcountercounter} {
						display: none;
					}
				`;
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						for (let key in this.defaults.sliders) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Slider",
							plugin: this,
							keys: ["sliders", key],
							basis: "30%",
							label: this.defaults.sliders[key].description,
							value: this.settings.sliders[key]
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					BDFDB.PatchUtils.forceAllUpdates(this);
				}
			}

			processChannelTextAreaContainer (e) {
				let editorContainer = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ChannelEditorContainer"});
				if (editorContainer && editorContainer.props.type && !editorContainer.props.disabled) {
					if (!BDFDB.ArrayUtils.is(e.returnvalue.props.children)) e.returnvalue.props.children = [e.returnvalue.props.children];
					this.injectCounter(e.returnvalue, e.returnvalue.props.children, editorContainer.props.type.analyticsName || editorContainer.props.type, BDFDB.dotCN.textarea);
				}
			}

			processNote (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["TextAreaAutosize", "TextArea", "PlainTextArea"]});
				if (index > -1) this.injectCounter(e.returnvalue, children, e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.usernotepopout) > -1 ? "popoutnote" : "profilenote", "textarea");
			}

			processNicknameSection (e) {
				e.returnvalue.props.children = BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN._charcountercounteradded,
					children: [
						e.returnvalue.props.children,
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.charcounter, BDFDB.disCN._charcountercounter, BDFDB.disCN._charcounternickcounter),
							children: `${(e.instance.props.pendingNick || "").length}/${maxLengths.nick}`
						})
					].flat(10)
				});
			}

			processCustomStatusModal (e) {
				let formItem = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.emojiinputcontainer]]});
				if (formItem) this.injectCounter(formItem, formItem.props.children, "customstatus", BDFDB.dotCN.input);
			}
			
			injectCounter (parent, children, type, refClass, parsing) {
				if (!children || nativeCounters.indexOf(type) > -1) return;
				if (parent.props.className) parent.props.className = BDFDB.DOMUtils.formatClassName(parent.props.className, BDFDB.disCN._charcountercounteradded);
				else parent.props.children = BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN._charcountercounteradded,
					children: parent.props.children
				});
				children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CharCounter, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._charcountercounter, type && BDFDB.DiscordClasses[`_charcounter${typeMap[type] || type}counter`] && BDFDB.disCN[`_charcounter${typeMap[type] || type}counter`]),
					refClass: refClass,
					parsing: parsing,
					max: maxLengths[type] || (BDFDB.LibraryModules.NitroUtils.canUseIncreasedMessageLength(BDFDB.UserUtils.me) ? BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH_PREMIUM : BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH),
					showPercentage: this.settings.sliders.showPercentage,
					onChange: instance => {
						let node = BDFDB.ReactUtils.findDOMNode(instance);
						let form = node && BDFDB.DOMUtils.getParent(BDFDB.dotCN.chatform, node);
						if (form) {
							let typing = form.querySelector(BDFDB.dotCN.typing);
							if (typing) typing.style.setProperty("margin-right", `${BDFDB.DOMUtils.getWidth(node) + 10}px`);
						}
					}
				}));
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();

const config = {
	info: {
		name: "Double Click To Edit",
		id: "DoubleClickToEdit",
		description: "Double click a message you wrote to quickly edit it",
		version: "9.3.2",
		author: "Farcrada",
		updateUrl: "https://raw.githubusercontent.com/Farcrada/DiscordPlugins/master/Double-click-to-edit/DoubleClickToEdit.plugin.js"
	}
}


class DoubleClickToEdit {

	//I like my spaces. 
	getName() { return config.info.name; }
	getAuthor() { return `${config.info.author}, original idea by Jiiks`; }


	load() {
		try {
			global.ZeresPluginLibrary.PluginUpdater.checkForUpdate(config.info.name, config.info.version, config.info.updateUrl);
		}
		catch (err) {
			console.error(this.getName(), "Plugin Updater could not be reached.", err);
		}
	}

	start() {
		try {
			//Classes
			this.selectedClass = BdApi.findModuleByProps("message", "selected").selected;
			this.messagesWrapper = BdApi.findModuleByProps("empty", "messagesWrapper").messagesWrapper;

			//Reply functions
			this.replyToMessage = BdApi.findModuleByProps("replyToMessage").replyToMessage;
			this.getChannel = BdApi.findModuleByProps("getChannel", "getDMFromUserId").getChannel;

			//Stores
			this.MessageStore = BdApi.findModuleByProps("receiveMessage", "editMessage");
			this.CurrentUserStore = BdApi.findModuleByProps("getCurrentUser");

			//Settings
			this.SwitchItem = BdApi.findModuleByDisplayName("SwitchItem");

			//Events
			document.addEventListener('dblclick', this.doubleclickFunc);

			this.doubleClickToReplySetting = BdApi.loadData(config.info.id, "doubleClickToReplySetting") ?? false;
		}
		catch (err) {
			try {
				console.error("Attempting to stop after starting error...", err)
				this.stop();
			}
			catch (err) {
				console.error(this.getName() + ".stop()", err);
			}
		}
	}

	//By doing this we make sure we're able to remove our event
	//otherwise it gets stuck on the page and never actually unloads.
	doubleclickFunc = (e) => this.handler(e);

	stop = () => document.removeEventListener('dblclick', this.doubleclickFunc);

	getSettingsPanel() {
		//Anonymous function to preserve the this scope,
		//which also makes it an anonymous functional component;
		//Pretty neat.
		return () => {
			//Since inherently when you toggle something you need to know what you're toggling from
			//because of this instead of using useState you'd use useReducer
			const [state, dispatch] = BdApi.React.useReducer(currentState => {
				//This runs when you flick the switch
				//Starting with reversing the current state:
				const newState = !currentState;

				//Saving the new state
				this.doubleClickToReplySetting = newState;
				BdApi.saveData(config.info.id, "doubleClickToReplySetting", newState);

				//Returning the new state
				return newState;

				//Default value
			}, this.doubleClickToReplySetting)

			return BdApi.React.createElement(this.SwitchItem, {
				//The state that is loaded with the default value
				value: state,
				note: "Enable to double click another's message and start replying.",
				//Since onChange passes the current state we can simply invoke it as such
				onChange: dispatch
				//Discord Is One Of Those
			}, "Enable Replying");
		}
	}

	handler(e) {
		//Check if we're not double clicking a video
		if (e.target.className.startsWith("video"))
			return;

		//Target the message
		const messageDiv = e.target.closest('li > [class^=message]');
		//If it finds nothing, null it.
		if (!messageDiv)
			return;
		//Make sure we're not resetting when the message is already in edit-mode.
		if (messageDiv.classList.contains(this.selectedClass))
			return;

		//Basically make a HTMLElement/Node interactable with it's React components.
		const instance = BdApi.getInternalInstance(messageDiv);
		//Mandatory nullcheck
		if (!instance)
			return;


		//The message instance is filled top to bottom, as it is in view.
		//As a result, "baseMessage" will be the actual message you want to address. And "message" will be the reply.
		//Maybe the message has a reply, so check if "baseMessage" exists and otherwise fallback on "message".
		const message = this.getValueFromKey(instance, "baseMessage") ?? this.getValueFromKey(instance, "message");

		if (message)
			if (message.author.id === this.CurrentUserStore.getCurrentUser().id) {
				this.MessageStore.startEditMessage(message.channel_id, message.id, message.content);
			}
			else if (this.doubleClickToReplySetting) {
				this.replyToMessage(this.getChannel(message.channel_id), message, e);
			}
	}

	getValueFromKey(instance, searchkey) {
		//Where we want to search.
		const whitelist = {
			memoizedProps: true,
			child: true,
			sibling: true
		};

		return function getKey(instance) {
			//Pre-define
			let result = undefined;
			//Make sure it exists and isn't a "paradox".
			if (instance && !Node.prototype.isPrototypeOf(instance)) {
				//Get our own keys
				const keys = Object.getOwnPropertyNames(instance);
				//As long as we don't have a result, lets go through.
				for (let i = 0; result === undefined && i < keys.length; i++) {
					//Store our key for readability
					const key = keys[i];
					//Check if there is a key
					if (key) {
						//Store the value
						const value = instance[key];
						//Is our key what we want?
						if (searchkey === key)
							result = value;
						//Otherwise check if the value of a key is something we can search through
						//and whitelisted; of course.
						else if ((typeof value === "object" || typeof value === "function") &&
							(whitelist[key] || key[0] == "." || !isNaN(key[0])))
							//Lets go nesting; lets go!
							result = getKey(value);
					}
				}
			}
			//If a poor sod got found this will not be `undefined`
			return result;
			//Start our mayhem
		}(instance);
	}
}