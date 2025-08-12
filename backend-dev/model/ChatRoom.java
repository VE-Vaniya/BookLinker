package com.example.demo.model;

public class ChatRoom {
    private String chatId;
    private String senderEmail;
    private String receiverEmail;

    public ChatRoom() {}

    public ChatRoom(String chatId, String senderEmail, String receiverEmail) {
        this.chatId = chatId;
        this.senderEmail = senderEmail;
        this.receiverEmail = receiverEmail;
    }

    public String getChatId() { return chatId; }
    public void setChatId(String chatId) { this.chatId = chatId; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getReceiverEmail() { return receiverEmail; }
    public void setReceiverEmail(String receiverEmail) { this.receiverEmail = receiverEmail; }
}
