'use strict';

/**
 * A View that handles displaying Messages of type CHAT.
 */
function ChatLogImageItem(message) {
    var self = this;

    self.message = message;

    // Chat Item Methods

    self.templateUrl = 'templates/common/chat';
    self.templateName = 'image_item.tmpl';
    self.timestamp = ko.pureComputed(function() {
        return self.message.dateReceived();
    });
    self.listItemClass = ko.observable('image-chat-highlight');

    // UI Methods

    self.shouldShowSaveToNotesButton = ko.pureComputed(function() {
        var key = CharacterManager.activeCharacter().playerType().key;
        return key == PlayerTypes.characterPlayerType.key;
    });

    self.image = ko.pureComputed(function() {
        var card = self.getCard();
        if (!card) {
            return 'https://www.gravatar.com/avatar/{}?d=mm';
        }
        return card.get('imageUrl');
    });

    self.name = ko.pureComputed(function() {
        var card = self.getCard();
        if (!card) {
            return self.message.fromUsername();
        }
        return card.get('name') + ' (' + self.message.fromUsername() + ')<br />Private';
    });

    self.messageImage = ko.pureComputed(function() {
        return Utility.string.createDirectDropboxLink(self.message.item().json.url);
    });

    self.html = ko.pureComputed(function() {
        return '<h3>{name}</h3>'.replace(
            '{name}', self.message.item().json.name
        );
    });

    self.imageHtml = function() {
        return '<img src="{url}" width="100%" />'.replace('{url}', self.messageImage());
    };

    self.saveToNotes = function() {
        var key = CharacterManager.activeCharacter().key();
        var date = (new Date()).toDateString();

        var note = new Note();
        note.characterId(key);
        note.text(self.html() + '\n\n' + date + '\n\n' + self.imageHtml());
        note.save();

        Notifications.notes.changed.dispatch();
        Notifications.userNotification.successNotification.dispatch('Saved to Notes.');
    };

    /* Card Methods */

    self.getCard = function() {
        var character = CharacterManager.activeCharacter();
        var chatService = ChatServiceManager.sharedService();
        var chatRoom = chatService.rooms[self.message.fromBare()];
        if (!chatRoom) { return null; }
        var occupant = chatRoom.roster[self.message.fromUsername()];
        if (!occupant) {
            return null;
        }

        // Get the current card service.
        var jid = occupant.jid;
        var cardService = null;
        if (character.playerType().key == 'character') {
            cardService = CharacterCardPublishingService.sharedService();
        } else {
            cardService = DMCardPublishingService.sharedService();
        }

        return cardService.pCards[jid] ? cardService.pCards[jid]: null;
    };
}
