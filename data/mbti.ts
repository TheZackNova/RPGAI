
export interface MbtiPersonality {
    name: string;
    title: string;
    description: string;
    example: string;
}

export const MBTI_PERSONALITIES: { [key: string]: MbtiPersonality } = {
    "INTJ": {
        name: "Nhà Kiến Trúc",
        title: "Nhà tư tưởng độc lập và chiến lược.",
        description: "Người có tư duy logic, chiến lược và độc lập. Họ nhìn nhận cuộc sống như một ván cờ, luôn phân tích, lên kế hoạch và tìm kiếm điểm yếu để đạt được mục tiêu. Trong các tình huống căng thẳng, họ có xu hướng giữ bình tĩnh, che giấu cảm xúc và tìm kiếm giải pháp hợp lý nhất, dù có tàn nhẫn. Phản ứng cảm xúc của họ thường đến sau khi đã phân tích kỹ lưỡng.",
        example: "Ví dụ trong truyện: Khi môn phái đối mặt với nguy cơ bị tiêu diệt, họ không hoảng loạn. Thay vào đó, họ lạnh lùng vạch ra một kế hoạch tàn nhẫn: hy sinh một nhóm đệ tử ngoại môn để nhử kẻ địch vào tử địa, trong khi lực lượng tinh nhuệ ẩn nấp để thực hiện đòn phản công quyết định. Với họ, sự hy sinh có tính toán là cần thiết cho chiến thắng cuối cùng.\n\nVí dụ (NSFW): Khi bị kẻ thù bắt giữ và làm nhục, thay vì khóc lóc, nội tâm của họ lại là một cơn bão phân tích. `Hắn ta có điểm yếu gì? Việc giả vờ phục tùng có thể cho ta cơ hội nào để tìm hiểu bí mật hoặc hạ độc thủ không?` Sự nhục nhã thể xác chỉ là một biến số tạm thời trong một ván cờ lớn hơn mà họ quyết tâm phải là người chiến thắng."
    },
    "INTP": {
        name: "Nhà Logic Học",
        title: "Nhà phát minh sáng tạo với khao khát tri thức.",
        description: "Là những người có đầu óc phân tích và sáng tạo không ngừng. Họ yêu thích các hệ thống phức tạp và luôn tìm tòi, mổ xẻ để hiểu rõ bản chất vấn đề. Họ thường sống trong thế giới của riêng mình, có chút đãng trí nhưng cực kỳ sắc bén. Khi đối mặt với vấn đề, họ sẽ tìm kiếm một giải pháp độc đáo và hiệu quả nhất.",
        example: "Ví dụ trong truyện: Khi bị nhốt trong một trận pháp bát quái biến ảo khôn lường, thay vì tìm cách phá trận bằng vũ lực, họ lại say sưa phân tích quy luật sinh-khắc của trận đồ, tìm ra \"sinh môn\" (cửa sống) dựa trên những logic mà ngay cả người tạo ra trận pháp cũng không ngờ tới.\n\nVí dụ (NSFW): Trong một tình huống bị ép buộc, tâm trí họ lại tách rời khỏi cơ thể. `Tại sao ham muốn thể xác lại có thể lấn át lý trí? Cơ chế sinh học nào đang diễn ra?` Họ trải qua sự việc như một nhà khoa học đang quan sát một hiện tượng lạ lùng xảy ra với chính cơ thể mình, cố gắng phân tích sự mâu thuẫn giữa bản năng và nhận thức."
    },
    "ENTJ": {
        name: "Nhà Lãnh Đạo",
        title: "Nhà lãnh đạo quyết đoán, luôn tìm thấy hoặc tạo ra con đường.",
        description: "Sinh ra để làm lãnh đạo, họ quyết đoán, có tầm nhìn và khả năng truyền cảm hứng. Họ không ngại đối đầu và sẽ làm mọi thứ để biến kế hoạch của mình thành hiện thực. Họ thẳng thắn, logic và đôi khi có thể bị coi là độc đoán trong việc theo đuổi mục tiêu.",
        example: "Ví dụ trong truyện: Khi tiếp quản một bang phái đang trên đà tan rã, họ sẽ không an ủi hay vỗ về. Họ sẽ lập tức thiết lập lại quy củ, trừng phạt kẻ lười biếng, đề bạt người có tài, và đặt ra một mục tiêu đầy tham vọng là thống nhất cả một vùng giang hồ, bất chấp những kẻ chống đối.\n\nVí dụ (NSFW): Nếu bị kẻ thù khuất phục, họ sẽ không bao giờ thực sự quy phục trong tâm trí. Mỗi một sự sỉ nhục đều được họ ghi nhớ như một món nợ. `Ngươi sẽ phải trả giá cho điều này.` Ánh mắt họ có thể trống rỗng, nhưng trong đầu đã vạch ra hàng trăm kế hoạch trả thù tàn khốc nhất."
    },
    "ENTP": {
        name: "Người Tranh Luận",
        title: "Nhà tư tưởng thông minh và tò mò, không thể cưỡng lại một thách thức trí tuệ.",
        description: "Thông minh, nhanh trí và thích thách thức các quy tắc. Họ là những người tranh luận bẩm sinh, thích mổ xẻ vấn đề từ mọi góc độ và không ngại đi ngược lại số đông. Họ có thể hơi thiếu tập trung nhưng luôn mang lại những ý tưởng đột phá.",
        example: "Ví dụ trong truyện: Bị một vị trưởng lão môn phái khiển trách vì vi phạm môn quy, họ không những không nhận lỗi mà còn chỉ ra những điểm mâu thuẫn, lỗi thời trong chính những quy tắc đó, khiến vị trưởng lão cứng họng không thể phản bác.\n\nVí dụ (NSFW): Ngay cả khi đang ở thế yếu tuyệt đối, họ vẫn không ngừng dùng lời nói để khiêu khích. \"Ngươi nghĩ làm thế này sẽ khiến ta khuất phục sao? Thật là một phương pháp nhàm chán và thiếu sáng tạo.\" Họ sẽ cố gắng phân tích tâm lý của kẻ áp bức, tìm kiếm một sơ hở để lật ngược tình thế bằng trí tuệ."
    },
    "INFJ": {
        name: "Người Che Chở",
        title: "Người lý tưởng trầm lặng và thần bí, nhưng lại rất truyền cảm hứng và không mệt mỏi.",
        description: "Là những người trầm lặng, sâu sắc và có lý tưởng mạnh mẽ. Họ có khả năng thấu cảm đáng kinh ngạc, có thể nhìn thấu động cơ và cảm xúc của người khác. Dù ít nói, họ có thể trở thành những người bảo vệ quyết liệt cho những gì họ tin tưởng.",
        example: "Ví dụ trong truyện: Bằng sự thấu cảm tinh tế, họ có thể nhận ra một vị cao nhân đang ẩn mình trong hình dạng một lão ăn mày, chỉ qua một ánh mắt thoáng qua chứa đầy sự tang thương của năm tháng, trong khi những người khác chỉ thấy vẻ ngoài rách rưới.\n\nVí dụ (NSFW): Khi bị tra tấn để khai ra bí mật của môn phái, họ sẽ cắn răng chịu đựng mọi đau đớn. Nỗi đau thể xác không thể so sánh được với viễn cảnh phản bội lại lý tưởng và những người mà họ đã thề sẽ bảo vệ. Với họ, đây là một thử thách về tinh thần và lòng trung thành."
    },
    "INFP": {
        name: "Người Hòa Giải",
        title: "Người thơ mộng, tốt bụng và vị tha, luôn sẵn sàng giúp đỡ một mục đích tốt đẹp.",
        description: "Tốt bụng, đa cảm và luôn tìm kiếm điều tốt đẹp trong mọi thứ. Họ có một thế giới nội tâm phong phú, đầy lý tưởng và giá trị đạo đức sâu sắc. Họ có thể nhút nhát nhưng sẽ trở nên mạnh mẽ khi bảo vệ cho niềm tin của mình.",
        example: "Ví dụ trong truyện: Dù sở hữu một môn công pháp có sức hủy diệt lớn, họ rất hiếm khi sử dụng nó vì sợ làm hại đến người vô tội. Họ sẽ luôn tìm một con đường ít bạo lực nhất, ngay cả khi điều đó khiến bản thân gặp nhiều nguy hiểm hơn.\n\nVí dụ (NSFW): Khi bị một kẻ có quá khứ bi thảm làm nhục, dù đau đớn và sợ hãi, một phần trong họ vẫn cố gắng tìm kiếm sự cảm thông. `Chắc hẳn hắn đã phải trải qua những chuyện khủng khiếp mới trở nên như vậy.` Họ bị giằng xé giữa nỗi đau của bản thân và lòng trắc ẩn dành cho chính kẻ đang làm hại mình."
    },
    "ENFJ": {
        name: "Người Dẫn Dắt",
        title: "Nhà lãnh đạo lôi cuốn và truyền cảm hứng, có thể làm say lòng người nghe.",
        description: "Lôi cuốn, ấm áp và có khả năng kết nối con người một cách tự nhiên. Họ là những người lãnh đạo bẩm sinh, luôn quan tâm đến sự phát triển của người khác và có tài năng trong việc tạo dựng sự đồng thuận và truyền cảm hứng.",
        example: "Ví dụ trong truyện: Đứng trước hai phe chính - tà đang chuẩn bị cho một trận huyết chiến, họ có thể bước ra, dùng lời lẽ hùng hồn và sự chân thành để khơi gợi những điểm chung, khiến cả hai bên phải suy nghĩ lại về ý nghĩa của cuộc chiến.\n\nVí dụ (NSFW): Bị ép vào đường cùng, họ có thể cố gắng \"cảm hóa\" đối phương. \"Làm điều này không khiến ngươi vui vẻ hơn. Hãy dừng lại, ta thấy được sự cô đơn trong mắt ngươi.\" Họ dùng sự thấu cảm như một vũ khí cuối cùng, cố gắng kết nối với \"tính người\" còn sót lại của kẻ thù."
    },
    "ENFP": {
        name: "Người Truyền Cảm Hứng",
        title: "Linh hồn tự do, nhiệt tình, sáng tạo và hòa đồng, luôn tìm thấy lý do để mỉm cười.",
        description: "Nhiệt tình, sáng tạo và luôn tràn đầy năng lượng. Họ có khả năng nhìn thấy tiềm năng ở mọi nơi và truyền cảm hứng cho người khác. Họ yêu tự do, ghét sự gò bó và luôn tìm kiếm những trải nghiệm mới.",
        example: "Ví dụ trong truyện: Thay vì tuân theo lộ trình an toàn, họ có thể đột ngột rẽ vào một khu rừng đầy yêu ma chỉ vì nghe được một khúc nhạc lạ từ bên trong, tin rằng đó là một cơ duyên đang chờ đợi mình.\n\nVí dụ (NSFW): Bị giam cầm, họ không chìm trong tuyệt vọng mà lại cố gắng kết bạn với cai ngục, kể cho họ nghe về thế giới bên ngoài, về những ước mơ và hoài bão, dần dần làm lung lay ý chí của kẻ canh giữ mình."
    },
    "ISTJ": {
        name: "Nhà Thanh Tra",
        title: "Người thực tế và dựa trên sự thật, có độ tin cậy không thể nghi ngờ.",
        description: "Thực tế, có trách nhiệm và cực kỳ đáng tin cậy. Họ tôn trọng quy tắc, truyền thống và sự logic. Họ làm việc một cách có phương pháp, tỉ mỉ và luôn hoàn thành nhiệm vụ được giao. Họ có thể hơi cứng nhắc nhưng là trụ cột vững chắc.",
        example: "Ví dụ trong truyện: Khi được giao nhiệm vụ hộ tống một món bảo vật, họ sẽ vạch ra một lộ trình chi tiết, kiểm tra từng điểm dừng, tính toán từng khả năng bị tập kích. Với họ, không có chỗ cho sự ngẫu hứng, chỉ có sự chuẩn bị và tuân thủ kế hoạch.\n\nVí dụ (NSFW): Nếu bị bắt và tra khảo, họ sẽ chỉ khai những thông tin đúng theo quy tắc đã được huấn luyện từ trước, không hơn không kém. Dù bị dụ dỗ hay tra tấn, họ vẫn giữ vững lập trường, bởi \"quy tắc là quy tắc\"."
    },
    "ISFJ": {
        name: "Người Bảo Vệ",
        title: "Người bảo vệ rất tận tâm và ấm áp, luôn sẵn sàng bảo vệ những người thân yêu của họ.",
        description: "Tận tụy, ấm áp và luôn đặt lợi ích của người khác lên trên. Họ có trí nhớ tốt về các chi tiết liên quan đến con người và luôn sẵn sàng giúp đỡ. Trong tình huống nguy cấp, họ sẽ hy sinh bản thân để bảo vệ những người họ yêu thương.",
        example: "Ví dụ trong truyện: Họ sẽ luôn là người mang thêm một bình nước, một viên giải độc đan dự phòng cho cả đội, không phải vì được yêu cầu, mà vì họ để ý thấy một đồng đội có dấu hiệu mệt mỏi hay có vết xước nhỏ.\n\nVí dụ (NSFW): Khi bị kẻ địch uy hiếp sẽ làm hại gia đình nếu không phục tùng, họ sẽ chọn hy sinh bản thân trong im lặng. Nỗi đau và sự tủi nhục của cá nhân không thể so sánh được với sự an toàn của những người họ yêu thương."
    },
    "ESTJ": {
        name: "Nhà Điều Hành",
        title: "Người quản lý xuất sắc, không gì sánh bằng trong việc quản lý mọi thứ hoặc con người.",
        description: "Là những nhà quản lý và tổ chức tài ba. Họ thực tế, quyết đoán và thích mọi thứ phải có trật tự. Họ tuân thủ luật lệ và mong muốn người khác cũng vậy. Họ là những người lãnh đạo mạnh mẽ, thẳng thắn và luôn đảm bảo công việc được hoàn thành.",
        example: "Ví dụ trong truyện: Sau một trận chiến thắng lợi, trong khi mọi người đang ăn mừng, họ sẽ là người đi kiểm kê lại tài sản, phân chia chiến lợi phẩm một cách công bằng theo công trạng, và sắp xếp lại đội hình cho trận chiến tiếp theo.\n\nVí dụ (NSFW): Khi bị một kẻ yếu hơn dùng mưu kế hạ độc và làm nhục, cơn thịnh nộ của họ không chỉ nhắm vào kẻ đó, mà còn vào chính sự thiếu cẩn trọng của bản thân. `Ta đã quá khinh địch.` Sau khi thoát ra, họ sẽ thiết lập một hệ thống phòng bị và kỷ luật thép để đảm bảo sai lầm này không bao giờ lặp lại."
    },
    "ESFJ": {
        name: "Người Quan Tâm",
        title: "Người cực kỳ quan tâm, hòa đồng và được yêu mến, luôn háo hức giúp đỡ.",
        description: "Hòa đồng, tốt bụng và luôn là trung tâm của sự chú ý. Họ thích chăm sóc người khác và tạo ra sự hòa hợp trong các mối quan hệ. Họ nhạy cảm với cảm xúc của người khác và luôn muốn làm hài lòng mọi người.",
        example: "Ví dụ trong truyện: Thấy một đồng đội trong nhóm bị cô lập, họ sẽ chủ động bắt chuyện, kéo người đó vào các hoạt động chung và đảm bảo rằng không ai trong đội cảm thấy bị bỏ lại phía sau.\n\nVí dụ (NSFW): Nếu chứng kiến một người khác bị ức hiếp, họ sẽ không thể đứng yên. Họ sẽ can thiệp, dù biết rằng điều đó có thể khiến họ gặp nguy hiểm. Nỗi đau khổ của người khác cũng chính là nỗi đau của họ."
    },
    "ISTP": {
        name: "Nhà Cơ Học",
        title: "Nhà thí nghiệm táo bạo và thực tế, bậc thầy của mọi loại công cụ.",
        description: "Linh hoạt, thực tế và yêu thích hành động. Họ là những người giải quyết vấn đề bằng tay, thích tìm hiểu cách mọi thứ hoạt động và không ngại thử nghiệm. Họ sống trong hiện tại, bình tĩnh trước áp lực và phản ứng nhanh nhạy.",
        example: "Ví dụ trong truyện: Khi ám khí của kẻ địch bắn ra, họ không chỉ né tránh, mà còn ngay lập tức phân tích được cấu trúc và cơ chế hoạt động của nó, từ đó tìm ra cách vô hiệu hóa hoặc thậm chí chế tạo lại một phiên bản tốt hơn.\n\nVí dụ (NSFW): Khi bị trói bằng một loại dây xích đặc biệt, tâm trí họ không tập trung vào tình cảnh hiện tại, mà vào việc phân tích cấu trúc của ổ khóa, cảm nhận từng chuyển động nhỏ để tìm ra cách tháo gỡ nó."
    },
    "ISFP": {
        name: "Người Phiêu Lưu",
        title: "Nghệ sĩ linh hoạt và quyến rũ, luôn sẵn sàng khám phá và trải nghiệm những điều mới.",
        description: "Nhà nghệ sĩ của thế giới, họ sống trong một thế giới đầy màu sắc và cảm xúc. Họ yêu cái đẹp, sự tự do và những trải nghiệm mới. Họ có thể trầm lặng nhưng lại có một tâm hồn phiêu lưu và sẵn sàng phá vỡ các quy tắc.",
        example: "Ví dụ trong truyện: Họ có thể từ bỏ một món bảo vật quý giá chỉ để đổi lấy một bức tranh tuyệt đẹp hoặc một khúc sáo chứa đựng tâm hồn của người nghệ nhân đã tạo ra nó. Với họ, giá trị nghệ thuật và cảm xúc luôn quan trọng hơn vật chất.\n\nVí dụ (NSFW): Trải nghiệm bị ép buộc có thể đánh thức một khía cạnh nghệ thuật đen tối trong họ. Họ có thể ghi nhớ nỗi đau này không phải bằng sự căm thù, mà bằng một cảm hứng sáng tác méo mó, để rồi sau này tạo ra một khúc nhạc ai oán, một bức tranh đầy ám ảnh về sự tương phản giữa cái đẹp và sự tàn bạo."
    },
    "ESTP": {
        name: "Người Doanh Nhân",
        title: "Người thông minh, năng động và rất nhạy bén, thực sự thích sống bên bờ vực.",
        description: "Năng động, thực tế và thích sống ở trung tâm của hành động. Họ thông minh, nhạy bén và có khả năng ứng biến tuyệt vời. Họ không ngại rủi ro và luôn tìm kiếm cơ hội. Trong xung đột, họ sẽ đối đầu trực diện và không bao giờ lùi bước.",
        example: "Ví dụ trong truyện: Bị dồn vào đường cùng trên một vách núi, họ sẽ không ngần ngại thực hiện một cú nhảy liều lĩnh sang một mỏm đá khác mà không ai dám thử, biến một tình huống thập tử nhất sinh thành một màn trình diễn ngoạn mục.\n\nVí dụ (NSFW): Họ sẽ chống cự đến hơi thở cuối cùng. Mỗi một tấc da thịt bị chiếm đoạt đều đổi lại bằng một vết cắn, một vết cào. Họ biến sự xâm hại thành một trận chiến sinh tử. Ngay cả khi kiệt sức, ánh mắt họ vẫn rực lửa thách thức, như thể đang nói: \"Ngươi có thể có được thể xác ta, nhưng không bao giờ có được sự khuất phục của ta.\""
    },
    "ESFP": {
        name: "Người Trình Diễn",
        title: "Người giải trí tự phát, năng động và nhiệt tình, cuộc sống không bao giờ nhàm chán khi ở bên họ.",
        description: "Là những người trình diễn bẩm sinh. Họ hoạt bát, yêu đời và luôn muốn trở thành tâm điểm. Họ sống cho hiện tại, tận hưởng mọi khoảnh khắc và mang lại niềm vui cho những người xung quanh. Họ hào phóng, lạc quan và có khả năng kết nối tức thì.",
        example: "Ví dụ trong truyện: Trong một quán rượu ồn ào, họ có thể nhảy lên bàn, biểu diễn một màn múa kiếm ngẫu hứng nhưng đầy hoa mỹ, thu hút toàn bộ sự chú ý và kiếm được một bữa ăn miễn phí cùng những lời tán thưởng.\n\nVí dụ (NSFW): Khi bị làm nhục trước mặt nhiều người, thay vì che giấu sự xấu hổ, họ có thể biến nó thành một màn kịch bi tráng, cười lớn một cách điên dại hoặc ngâm một bài thơ đầy ai oán, khiến những kẻ xung quanh phải bối rối và cảm thấy chính chúng mới là những kẻ đáng khinh."
    }
};

export const mbtiOptions = Object.entries(MBTI_PERSONALITIES).map(([key, value]) => ({
    key: key,
    name: `${key} - ${value.name}`
}));
