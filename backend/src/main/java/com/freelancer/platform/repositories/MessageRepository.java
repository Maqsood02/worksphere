package com.freelancer.platform.repositories;

import com.freelancer.platform.models.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    
    @Query("{$or: [ {senderId: ?0, receiverId: ?1}, {senderId: ?1, receiverId: ?0} ]}")
    List<Message> findChatHistory(String user1, String user2);
    
    List<Message> findByReceiverIdAndIsReadFalse(String receiverId);
}
