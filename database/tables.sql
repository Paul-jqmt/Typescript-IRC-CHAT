create table messages (
    message_id int(255) not null, conversation_id int(255) not null, sender_id int(255) not null, message_content longtext, date_sent datetime not null, primary key (message_id), foreign key (conversation_id) references conversations (conversation_id), foreign key (sender_id) references users (user_id)
);

create table conversations (
    conversation_id int(255) not null, user_id int(255), primary key (conversation_id), foreign key (user_id) references users (user_id)
);

create table users (
    user_id int(255) not null, username text not null, pas sword text not null, firstname text, lastname text, date_created date not null, primary key (user_id)
);